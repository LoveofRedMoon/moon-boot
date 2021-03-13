import type { Logger } from 'log4js'
import type {
  RecurrenceRule,
  RecurrenceSpecDateRange,
  RecurrenceSpecObjLit,
} from 'node-schedule'

/**
 * Start Module
 */
export interface StartOpt {
  scanDir: string[]
}
export interface StartOption {
  scanDir?: string | string[]
}
export function start(option: string | StartOption): Promise<void>

/**
 * Env Module
 */
interface InfiRecrd {
  [key: string]: Record<any, InfiRecrd> | any
}
export interface Env {
  (path: string): string
  [key: string]: InfiRecrd
}
export function readAndSet(data: any, newData: any): void | any[]

/**
 * Data Transform Module
 */
export function Generic(index: number): symbol
export type MethodTypes = Array<{ key: string | symbol; type: TypeDefine[] }>
export type Constructor = new (...args: any[]) => any
export type TypeDefine = Constructor | Symbol | Array<TypeDefine>
export type TypeDeal = Constructor | Array<TypeDeal>
export function Type(
  t: TypeDefine
): <T extends number | TypedPropertyDescriptor<any> | undefined>(
  target: Object,
  propertyKey: string | symbol,
  which?: T
) => T extends TypedPropertyDescriptor<infer P> ? void | T : void
export function Alias(name: string | string[]): PropertyDecorator
export declare const Snake2Camel: ClassDecorator
export function transformData(raw: any, type?: TypeDeal): any
export function typeDefine2TypeDeal(raw: TypeDefine): TypeDeal
export function registerProperty(target: Object, key: string | symbol): void
/**
 * For MethodDecorator && PropertyDecorator
 * MethodDecorator returns ReturnType
 * PropertyDecorator returns PropertyType
 */
export function getType(target: Object, key: string | symbol): TypeDefine[]
/**
 * For ParameterDecorator, returns position idx type
 * @param idx method parameter index
 */
export function getType(
  target: Object,
  key: string | symbol,
  idx: number
): TypeDefine[]
/**
 *
 * For ParameterDecorator, returns paramter name's type
 * @param paramName method parameter name
 */
export function getType(
  target: Object,
  key: string | symbol,
  paramName: string | symbol
): TypeDefine[]
/**
 *
 * For ParameterDecorator, returns all parameter types
 */
export function getType(
  target: Object,
  key: string | symbol,
  paramName: null
): TypeDefine[][]
/**
 * Scan Module
 */
export function scanDir(p: string): Promise<void>

/**
 * Log4js Module
 */
export function getLogger(path: string): Logger

/**
 * Hook Module
 */
export interface HookOpt {
  order?: number
}
export function AfterScan(opt?: HookOpt): MethodDecorator
export function AfterEnv(opt?: HookOpt): MethodDecorator
export function AfterLog(opt?: HookOpt): MethodDecorator
export function BeforeStart(opt?: HookOpt): MethodDecorator
export function AfterStart(opt?: HookOpt): MethodDecorator

/**
 * Bean Module
 */
export interface ValueOption {
  type: TypeDeal
}
export interface AutowiredOption {
  required?: boolean
  name?: string | symbol
}
export function getBeanInstance<T>(type: new (...args: any[]) => T): Promise<T>
export function getBeanInstance(name: string | symbol): Promise<any>
export function reInjectAll(): Promise<void>
export function Value(p: string, opt?: ValueOption): PropertyDecorator
export function Autowired(
  name?: string | AutowiredOption,
  opt?: AutowiredOption
): PropertyDecorator
export function Bean(name?: string): ClassDecorator
export function BeforeBean(
  cb: (env: Env) => void | Promise<void>
): ClassDecorator
export function Condition(
  cb: (env: Env) => boolean | undefined | Promise<boolean | undefined>
): ClassDecorator

export declare const env: Env

/**
 * Schedule Module
 */
export type ScheduleRule =
  | RecurrenceRule
  | RecurrenceSpecDateRange
  | RecurrenceSpecObjLit
  | Date
  | string
  | number
export function Schedule(rule: ScheduleRule): MethodDecorator
export function Schedule(name: string, rule: ScheduleRule): MethodDecorator
export function cancelJob(
  name: string,
  reschedule?: boolean | undefined
): boolean | undefined
export function cancelNext(
  name: string,
  reschedule?: boolean | undefined
): boolean | undefined
export function reschedule(
  name: string,
  spec: string | number | RecurrenceRule
): boolean | undefined
export function nextInvocation(name: string): Date | undefined
