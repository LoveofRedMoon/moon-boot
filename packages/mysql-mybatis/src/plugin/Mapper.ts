import {
  getBeanInstance,
  getType,
  transformData,
  typeDefine2TypeDeal,
} from 'moon-boot'
import type { MysqlTemplate } from '@moonboot/plugin-mysql'
/**
 * @example trim({prefix: 'WHERE', prefixOverrides: ['AND', 'OR']})
 */
function trim(
  {
    prefix = '',
    prefixOverrides = [],
    suffix = '',
    suffixOverrides = [],
  }: {
    prefix?: string
    prefixOverrides?: string | string[]
    suffix?: string
    suffixOverrides?: string | string[]
  },
  ...statements: Array<string | undefined | null>
) {
  const s = statements.filter(Boolean)
  if (s.length) {
    return (
      ' ' +
      prefix +
      ' ' +
      s
        .join(' ')
        .replace(
          new RegExp(
            '^\\s*(' +
              (typeof prefixOverrides === 'string'
                ? prefixOverrides
                : prefixOverrides.join('|')) +
              ')',
            'i'
          ),
          ' '
        )
        .replace(
          new RegExp(
            '(' +
              (typeof suffixOverrides === 'string'
                ? suffixOverrides
                : suffixOverrides.join('|')) +
              ')\\s*$',
            'i'
          ),
          ' '
        ) +
      ' ' +
      suffix +
      ' '
    )
  } else {
    return ''
  }
}
/**
 * @example where('and name = #{name}', 'and 1 = 1')
 */
function where(...statements: Array<string | undefined | null>) {
  return trim(
    { prefix: 'WHERE', prefixOverrides: ['AND', 'OR'] },
    ...statements
  )
}
/**
 * @example set('name = #{name},')
 */
function set(...statements: Array<string | undefined | null>) {
  return trim({ prefix: 'SET', suffixOverrides: ['\\,'] }, ...statements)
}

/**
 * Returns first not blank statement
 * @example choose(undefined, 'AND 1 = 1', 'AND 2 = 1') ==> 'AND 1 = 1'
 */
function choose(...statements: Array<string | undefined | null>) {
  return statements.find(Boolean) ?? ''
}

const operators = { trim, where, set, choose }

export type MYBATIS_SQL =
  | string
  | ((
      data: any,
      operator: typeof operators
    ) => string | Array<string | undefined | null>)

function str(d: any) {
  switch (typeof d) {
    case 'string':
      return `'${d}'`
    case 'number':
    case 'bigint':
      return d.toString()
    case 'boolean':
      return d ? '1' : '0'
    case 'function':
    case 'undefined':
    case 'symbol':
      return ''
    default:
      if (d === null) {
        return ''
      } else {
        return JSON.stringify(d)
      }
  }
}

export function Select(sql: MYBATIS_SQL): MethodDecorator {
  return function (target, key, desc) {
    const functionStr = Function.prototype.toString.call(desc.value)
    // TODO 尝试解析参数列表
    const paramList: string[] = []
    const rawFunc = desc.value
    // @ts-ignore
    desc.value = async function () {
      const args = arguments
      let data = {}
      if (args.length === 1) {
        Object.assign(
          data,
          { parameter: args[0], _argu0: args[0] },
          args,
          args[0]
        )
      } else {
        Object.assign(
          data,
          { parameter: args },
          Array(args.length)
            .fill(0)
            .reduce((p, v, i) => ((p['_argu' + i] = v), p), {}),
          args
        )
      }
      const getSql = typeof sql === 'string' ? sql : sql(data, operators)
      const sql2 = Array.isArray(getSql)
        ? getSql.filter(Boolean).join(' ')
        : getSql
      const ds: any[] = []
      const sql3 = sql2.replace(/#\{([^\}]+)\}/g, (v, v1) => {
        const keys = v1.split('.').filter(Boolean)
        let d = data
        for (let i = 0; i < keys.length; i++) {
          d = d?.[keys[i]]
        }
        ds.push(d)
        return '?'
      })
      const bean: MysqlTemplate = await getBeanInstance('mysqlTemplate')
      try {
        const result = await bean.query(sql3, ds)
        const data = result[0]
        const fileds = result[1]
        const type = getType(target, key)
        if (Array.isArray(data)) {
          const useMulti = type[0] === Array
          if (useMulti) {
            type.shift()
            if (!type[0]) {
              return data
            }
            switch (type[0]) {
              case Number:
              case String:
              case Boolean:
                return (data as any[]).map((v) =>
                  transformData(
                    v[fileds[0].name],
                    // @ts-ignore
                    type[0]
                  )
                )
              case Function:
              case Array:
              case undefined:
                throw new Error(
                  '[moon] mysql-mybatis cannot transform data to ' + type[0]
                )
              default:
                if (typeof type[0] === 'symbol') {
                  throw new Error(
                    '[moon] mysql-mybatis cannot transform data to symbol'
                  )
                }
                return (data as any[]).map((v) =>
                  transformData(v, typeDefine2TypeDeal(type))
                )
            }
          } else {
            if (data.length !== 1) {
              throw new Error(
                '[moon] mysql-mybatis needed only one Result but got ' +
                  data.length
              )
            }
            switch (type[0]) {
              case Number:
              case String:
              case Boolean:
                return transformData(data[0][fileds[0].name], type[0])
              case Function:
              case Array:
              case undefined:
                throw new Error(
                  '[moon] mysql-mybatis cannot transform data to ' + type[0]
                )
              default:
                if (typeof type[0] === 'symbol') {
                  throw new Error(
                    '[moon] mysql-mybatis cannot transform data to symbol'
                  )
                }
                return transformData(data[0], typeDefine2TypeDeal(type))
            }
          }
        } else {
          // 返回Header
          switch (type[0]) {
            case Number:
              return data.affectedRows
            case String:
              return data.affectedRows + ''
            case Boolean:
              return !!data.affectedRows
            case Function:
            case Array:
            case undefined:
              throw new Error(
                '[moon] mysql-mybatis cannot transform data to ' + type[0]
              )
            default:
              if (typeof type[0] === 'symbol') {
                throw new Error(
                  '[moon] mysql-mybatis cannot transform data to symbol'
                )
              }
              return transformData(data, typeDefine2TypeDeal(type))
          }
        }
      } catch (e) {
        return (rawFunc as any).call(target, ...args, e)
      }
    }
  }
}
