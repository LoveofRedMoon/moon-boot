import type { Logger } from 'log4js'

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

/**
 * Data Transform Module
 */
export type Constructor = new (...args: any[]) => any
export type TypeDefine = Constructor | Symbol | Array<TypeDefine>
export type TypeDeal = Constructor | Array<TypeDeal>
export function transformData(raw: any, type?: TypeDeal): any

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
export function getBeanInstance(type: new (...args: any[]) => any): Promise<any>
export function getBeanInstance(name: string | symbol): Promise<any>
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
