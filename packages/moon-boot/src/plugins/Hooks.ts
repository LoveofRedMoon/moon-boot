import { StartOpt } from './Start'

type HookNames = 'afterScan' | 'afterEnv' | 'afterLog' | 'afterStart' | string
const hooks: Array<HookNames> = [
  'afterScan',
  'afterEnv',
  'afterLog',
  'beforeStart',
  'afterStart',
]
const callbacks: {
  [key in HookNames]: Array<HookOpt & { callback?: Function }>
} = {
  afterScan: [],
  afterEnv: [],
  afterLog: [],
  beforeStart: [],
  afterStart: [],
}

export interface HookOpt {
  order?: number
}

function getStage(stage: HookNames) {
  return function (opt?: HookOpt): MethodDecorator {
    return function (target, key, desc) {
      callbacks[stage].push(
        Object.assign({}, opt, { callback: (desc.value as any)?.bind(target) })
      )
    }
  }
}
export const AfterScan = getStage('afterScan')
export const AfterEnv = getStage('afterEnv')
export const AfterLog = getStage('afterLog')
export const BeforeStart = getStage('beforeStart')
export const AfterStart = getStage('afterStart')

export function trigger(stage: HookNames, opt: StartOpt) {
  return Promise.all(
    callbacks[stage]
      ?.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((v) => v.callback?.(opt)) ?? []
  )
}
