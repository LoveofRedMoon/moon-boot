import 'reflect-metadata'
import env, { Env } from './Env'
import { getLogger } from './Log'
import {
  AUTOWIRED,
  BEFORE_BEAN,
  CONDITION,
  FIELDS,
  TYPE,
  VALUE,
} from './SymbolGenerate'
import {
  registerProperty,
  TypeDefine,
  Constructor,
  transformData,
  TypeDeal,
} from './Transform'
const log = getLogger(__filename)

const beanMapper = new Map<Constructor, any | false>()
const beanNameMapper: Record<string, Constructor> = {}

function registerValue(target: Object, key: string | symbol) {
  const p: string | undefined = Reflect.getMetadata(VALUE, target, key)
  const types: TypeDeal[] | undefined = Reflect.getMetadata(TYPE, target, key)
  if (types?.some((v) => typeof v === 'symbol')) {
    throw new Error(`[moon] - @Value cannot inject generic type`)
  }
  if (p) {
    const m = p.lastIndexOf(':')
    const pre = m > -1 ? env(p.substring(0, m)) : env(p)
    if (pre !== null && pre !== void 0) {
      const newVal = transformData(pre, types)
      if (newVal !== target[key]) {
        target[key] = newVal
      }
    } else if (m > -1) {
      const newVal = transformData(p.substr(m + 1), types)
      if (newVal !== target[key]) {
        target[key] = newVal
      }
    } else {
      throw new Error(
        `[moon] could not inject ${target.constructor.name} property ${String(
          key
        )} for no placeholder`
      )
    }
  }
}

async function registerAutowired(target: Object, key: string | symbol) {
  const p: AutowiredOption | undefined = Reflect.getMetadata(
    AUTOWIRED,
    target,
    key
  )
  if (!p) {
    return
  }
  try {
    target[key] = await getBeanInstance(p.name as string)
  } catch (e) {
    if (p.required === false) {
      return
    }
    throw e
  }
}

async function tryToInject(instance: any) {
  const fields: Array<string | symbol> =
    Reflect.getMetadata(FIELDS, instance) || []
  return Promise.all(
    fields.map(async (key) => {
      // 注册Value属性
      registerValue(instance, key)
      // 注册Autowired属性
      await registerAutowired(instance, key)
    })
  )
}

export async function reInjectAll() {
  return Promise.all(
    Object.values(beanMapper).map(
      async (v) => v !== false && (await tryToInject(v))
    )
  )
}

export async function getBeanInstance(
  type: new (...args: any[]) => any
): Promise<any>
export async function getBeanInstance(name: string | symbol): Promise<any>
export async function getBeanInstance(
  type: (new (...args: any[]) => any) | string | symbol
) {
  if (typeof type === 'string') {
    let tp = type.trim()
    if (tp === '') {
      throw new Error(`[moon] bean name can not be empty`)
    }
    tp = tp[0].toLowerCase() + tp.substr(1)
    const t = beanNameMapper[tp]
    if (t) {
      return getBeanInstance(t)
    }
    throw new Error(`[moon] can not get bean with name ${type}`)
  } else if (typeof type === 'symbol') {
    throw new Error(`[moon] can not get bean with name ${type.description}`)
  } else {
    if (beanMapper.has(type)) {
      const item = beanMapper.get(type)
      if (item === false) {
        throw new Error(
          `[moon] can not get bean with name ${type} because condition is false`
        )
      }
      return item
    }
    if ((await Reflect.getMetadata(CONDITION, type)?.(env)) === false) {
      beanMapper.set(type, false)
      throw new Error(
        `[moon] can not get bean with name ${type} because condition is false`
      )
    }
    const instance = new type()
    beanMapper.set(type, instance)
    tryToInject(instance)
    log.debug(`[moon] - bean ${type.name} load success`)
    return instance
  }
}

export interface ValueOption {
  type: TypeDeal
}

export function Value(p: string, opt?: ValueOption): PropertyDecorator {
  return function (target, key) {
    registerProperty(target, key)
    Reflect.defineMetadata(VALUE, p, target, key)
    if (opt?.type) {
      const t = opt.type
      const ts = Array.isArray(t) ? t : [t]
      Reflect.defineMetadata(TYPE, ts, target, key)
    }
  }
}

export interface AutowiredOption {
  required?: boolean
  name?: string | symbol
}

export function Autowired(
  name?: string | AutowiredOption,
  opt?: AutowiredOption
): PropertyDecorator {
  return function (target, key): void {
    registerProperty(target, key)
    if (opt) {
      if (typeof name === 'string') {
        opt.name = name
      } else {
        Object.assign(opt, name)
      }
    } else {
      if (!name) {
        opt = {}
      } else if (typeof name === 'string') {
        opt = { name }
      } else {
        opt = name
      }
    }
    if (!opt.name) {
      opt.name = key
    }
    Reflect.defineMetadata(AUTOWIRED, opt, target, key)
  }
}

export function Bean(name?: string): ClassDecorator {
  return function (target) {
    const n = name ? name : target.name
    const nn = n[0].toLowerCase() + n.substr(1)
    // @ts-ignore
    beanNameMapper[nn] = target
    log.debug(`[moon] - bean ${nn} scan success`)
  }
}

export function BeforeBean(
  cb: (env: Env) => void | Promise<void>
): ClassDecorator {
  return function (target) {
    Reflect.defineMetadata(BEFORE_BEAN, cb, target)
  }
}

export function Condition(
  cb: (env: Env) => boolean | undefined | Promise<boolean | undefined>
): ClassDecorator {
  return function (target) {
    Reflect.defineMetadata(CONDITION, cb, target)
  }
}
