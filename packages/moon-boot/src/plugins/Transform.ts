import { getLogger } from './Log'
import { FIELDS, TYPE } from './SymbolGenerate'
const log = getLogger(__filename)
const GenericSymbol: Symbol[] = []
export function Generic(index: number) {
  if (isNaN(index) || index % 1 || index < 0 || index === Infinity) {
    throw new Error('Generic index must be non-negative integer')
  }
  while (GenericSymbol.length <= index) {
    GenericSymbol.push(Symbol('Generic'))
  }
  return GenericSymbol[index]
}
export type Constructor = new (...args: any[]) => any
export type TypeDefine = Constructor | Symbol | Array<TypeDefine>
export type TypeDeal = Constructor | Array<TypeDeal>
export function Type(t: TypeDefine): PropertyDecorator
export function Type(t: TypeDefine): MethodDecorator
export function Type(t: TypeDefine) {
  const ts = Array.isArray(t) ? t : [t]
  return function <T>(target: Object, key: string | symbol): void {
    Reflect.defineMetadata(TYPE, ts, target, key)
    if (arguments[2]) {
      registerProperty(target, key)
    }
  }
}
export function registerProperty(target: Object, key: string | symbol) {
  let complexFields = Reflect.getOwnMetadata(FIELDS, target)
  if (!complexFields) {
    complexFields = Reflect.hasMetadata(FIELDS, target)
      ? Reflect.getMetadata(FIELDS, target).slice(0)
      : []
    Reflect.defineMetadata(FIELDS, complexFields, target)
  }
  complexFields.push(key)
}
function typeDealToString(type: TypeDeal[]) {
  return (
    '[' +
    type.map((v) => (Array.isArray(v) ? typeDealToString(v) : v.name)) +
    ']'
  )
}
function assertTypeOnlyOne(type: TypeDeal[], raw: any) {
  if (type.length !== 1) {
    log.warn(
      `[moon] value '${raw}' can not transform to ${typeDealToString(
        type
      )} because type ${typeof raw} can not have generic types.`
    )
  }
}
function replaceGenericTypeWithSubTypes(raw: TypeDefine, sub: TypeDeal[]) {
  if (typeof raw === 'symbol') {
    const idx = GenericSymbol.indexOf(raw)
    if (idx < 0 || !sub[idx]) {
      throw new Error(
        `[moon] symbol '${raw.description}' is not generated GenericSymbols.`
      )
    }
    return sub[idx]
  } else if (Array.isArray(raw)) {
    return raw.map((v) => replaceGenericTypeWithSubTypes(v, sub))
  } else {
    return raw
  }
}
/**
 * 将任意值进行转化为具体类型, 支持json
 * A<B<D>, C> => type: [A, [B, D], C] or [A, [B, [D]], [C]]
 * A<B, C<D>> => type: [A, B, [C, D]] or [A, [B], [C, [D]]]
 * @param raw 原始数据
 * @param type 类型(含泛型), 泛型嵌套请看上面的示例
 */
export function transformData(raw: any, type?: TypeDeal): any {
  if (!type || raw === void 0 || raw === null) {
    return raw
  } else if (!Array.isArray(type)) {
    type = [type]
  }
  let firstType = type[0]
  while (Array.isArray(firstType)) {
    if (firstType.length !== 1) {
      throw new Error(
        `[moon] value '${raw}' can not transform to ${typeDealToString(
          type
        )} because first type must be single`
      )
    }
    firstType = firstType[0]
  }
  if (firstType !== Array && Array.isArray(raw)) {
    // 数组转化为单个值
    return transformData(raw[0], type)
  }
  if (firstType === Number) {
    assertTypeOnlyOne(type, raw)
    switch (typeof raw) {
      case 'number':
      case 'bigint':
        return raw
      case 'string':
        return parseFloat(raw)
      case 'boolean':
        return +raw
    }
  } else if (firstType === String) {
    assertTypeOnlyOne(type, raw)
    switch (typeof raw) {
      case 'string':
        return raw
      case 'number':
      case 'boolean':
      case 'bigint':
      case 'symbol':
        return raw.toString()
      default:
        return JSON.stringify(raw)
    }
  } else if (firstType === Boolean) {
    assertTypeOnlyOne(type, raw)
    return !!raw
    // } else if (firstType === Symbol) {
    //   throw new Error(
    //     `[moon] value '${raw}' can not transform to ${type
    //       .map((v) => v.name)
    //       .join()} because type Symbol is not suporrted.`
    //   )
  } else if (firstType === Array) {
    const subType = type.slice(1)
    if (Array.isArray(raw)) {
      return raw.map((v) => transformData(v, subType))
    }
    if (typeof raw === 'string' && raw[0] === '[') {
      try {
        const j: any[] = JSON.parse(raw)
        return j.map((v) => transformData(v, subType))
      } catch {}
    }
    return [transformData(raw, subType)]
  } else if (firstType === Object) {
    if (typeof raw === 'object' && raw !== null) {
      return raw
    }
    if (typeof raw === 'string' && raw[0] === '{') {
      try {
        return JSON.parse(raw)
      } catch {
        throw new Error(
          `[moon] value '${raw}' can not transform to ${typeDealToString(
            type
          )} because json parse error.`
        )
      }
    }
  } else {
    // 其他, 需要使用空构造函数进行构造
    let j: any
    try {
      j = typeof raw === 'string' ? JSON.parse(raw) : raw
      if (!j || typeof j !== 'object') {
        throw new Error(
          `[moon] value '${raw}' can not transform to ${typeDealToString(
            type
          )} because value is not an object.`
        )
      }
    } catch {
      throw new Error(
        `[moon] value '${raw}' can not transform to ${typeDealToString(
          type
        )} because json parse error.`
      )
    }
    const i = new firstType()
    const subTypes = type.slice(1)
    Object.keys(j).forEach((k) => {
      const types = (Reflect.getMetadata(TYPE, i, k) as
        | TypeDefine[]
        | undefined) || [
        Reflect.getMetadata('design:type', i, k) as Constructor,
      ]

      if (types && types[0]) {
        i[k] = transformData(
          j[k],
          types.map((v) => replaceGenericTypeWithSubTypes(v, subTypes))
        )
      } else {
        i[k] = j[k]
      }
    })
    return i
  }
  throw new Error(
    `[moon] value '${raw}' can not transform to ${typeDealToString(
      type
    )} because type ${typeof raw} is not suporrted.`
  )
}
