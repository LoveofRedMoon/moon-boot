import 'reflect-metadata'
import { join } from 'path'
import express, { Express, RequestHandler, Request } from 'express'
import {
  getLogger,
  getBeanInstance,
  Constructor,
  transformData,
  TypeDeal,
  env,
} from 'moon-boot'
import { CONTROLLER_PARAM, CONTROLLER_METHOD } from './SymbolGenerate'

const log = getLogger(__filename)

const controllers: Array<{ class: Constructor; path: string }> = []

export function Controller(path: string = '/'): ClassDecorator {
  return function (target) {
    controllers.push({
      // @ts-ignore
      class: target,
      path,
    })
  }
}

type ControllerMethodContent = Map<
  string | symbol,
  {
    path: string
    method: string
    exec: Function
  }
>

function HTTP_METHODS(method: string) {
  return function (path: string = ''): MethodDecorator {
    return function (target, key, desc) {
      const content: ControllerMethodContent | undefined = Reflect.getMetadata(
        CONTROLLER_METHOD,
        target
      )
      if (content) {
        content.set(key, {
          path,
          method,
          exec: desc.value as any,
        })
      } else {
        const newContent: ControllerMethodContent = new Map()
        newContent.set(key, {
          path,
          method,
          exec: desc.value as any,
        })
        Reflect.defineMetadata(CONTROLLER_METHOD, newContent, target)
      }
    }
  }
}

export const Get = HTTP_METHODS('get')
export const Post = HTTP_METHODS('post')
export const Put = HTTP_METHODS('put')
export const Delete = HTTP_METHODS('delete')

type ParamOptions =
  | {
      type: 'req' | 'res' | 'next'
      opts: object
    }
  | {
      type: 'path' | 'query' | 'header'
      opts: {
        name: string
        type?: TypeDeal
      }
    }
  | {
      type: 'body'
      opts: {
        type?: TypeDeal
      }
    }

function setParamPos(
  target: Object,
  key: string | symbol,
  idx: number,
  value: ParamOptions
) {
  const r: ParamOptions[] | undefined = Reflect.getMetadata(
    CONTROLLER_PARAM,
    target
  )
  if (r) {
    r[idx] = value
  } else {
    const r: ParamOptions[] = []
    r[idx] = value
    Reflect.defineMetadata(CONTROLLER_PARAM, r, target)
  }
}

export function Req(): ParameterDecorator {
  return function (target, key, idx) {
    setParamPos(target, key, idx, { type: 'req', opts: {} })
  }
}
export function Res(): ParameterDecorator {
  return function (target, key, idx) {
    setParamPos(target, key, idx, { type: 'res', opts: {} })
  }
}
export function Path(name: string, type?: TypeDeal): ParameterDecorator {
  return function (target, key, idx) {
    setParamPos(target, key, idx, { type: 'path', opts: { name, type } })
  }
}
export function Query(name: string, type?: TypeDeal): ParameterDecorator {
  return function (target, key, idx) {
    setParamPos(target, key, idx, { type: 'query', opts: { name, type } })
  }
}
export function Header(name: string, type?: TypeDeal): ParameterDecorator {
  return function (target, key, idx) {
    setParamPos(target, key, idx, { type: 'header', opts: { name, type } })
  }
}
export function Body(type?: TypeDeal): ParameterDecorator {
  return function (target, key, idx) {
    setParamPos(target, key, idx, { type: 'body', opts: { type } })
  }
}
/**
 * @deprecated
 */
export function Next(): ParameterDecorator {
  return function (target, key, idx) {
    setParamPos(target, key, idx, { type: 'next', opts: {} })
  }
}

export async function resolveController(): Promise<void> {
  const app = express()
  await Promise.all(
    controllers.map(async (c) => {
      try {
        const item = await getBeanInstance(c.class)
        const content:
          | ControllerMethodContent
          | undefined = Reflect.getMetadata(CONTROLLER_METHOD, item)
        content?.forEach((con, key) => {
          const path = join(c.path, con.path).replace(/\\/g, '/')
          const methodName = con.method
          const method = con.exec
          app[methodName](
            path,
            (function () {
              const r: ParamOptions[] =
                Reflect.getMetadata(CONTROLLER_PARAM, item) || []
              const needReturn = r.every((v) => v.type !== 'res')
              return async function (req, res, next) {
                const paramMapper = r.map((v) => {
                  switch (v.type) {
                    case 'req':
                      return req
                    case 'res':
                      return res
                    case 'next':
                      return next
                    case 'query':
                      return transformData(req.query[v.opts.name], v.opts.type)
                    case 'path':
                      return transformData(req.params[v.opts.name], v.opts.type)
                    case 'header':
                      return transformData(req.get(v.opts.name), v.opts.type)
                    case 'body':
                      return transformData(req.body, v.opts.type)
                  }
                })
                try {
                  const result = await method.apply(item, paramMapper)
                  if (needReturn) {
                    try {
                      res.send(result)
                    } catch {}
                  }
                } catch (e) {
                  log.error(e)
                  res.status(500).send('System error')
                }
              } as RequestHandler
            })()
          )
          log.info(
            `[moon] - register controller with ${methodName.toUpperCase()} ${path}`
          )
        })
      } catch (e) {
        console.log(e)
        log.error(`[moon] - fail to register controller with ${c.class.name}`)
      }
    })
  )
  return new Promise((r, j) => {
    app.on('error', j)
    const port = env('server.port') || 8080
    app.listen(port, () => {
      log.info(`[moon] - listen: ` + port)
      r()
    })
  })
}
