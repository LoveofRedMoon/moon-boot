import env, { readApplication } from './Env'
import { configLog4js, getLogger } from './Log'
import { scan } from './Scan'
import { trigger } from './Hooks'

export interface StartOpt {
  scanDir: string[]
}

export interface StartOption {
  scanDir?: string | string[]
}

const defaultOption: StartOption = {
  scanDir: process.cwd(),
}

function conbineOpt(raw: string | StartOption): StartOpt {
  if (typeof raw === 'string') {
    return { scanDir: [raw] }
  }
  const o = Object.assign({}, defaultOption, raw)
  const r: StartOpt = { scanDir: [] }
  if (Array.isArray(o.scanDir)) {
    r.scanDir = o.scanDir
  } else if (typeof o.scanDir === 'string') {
    r.scanDir = [o.scanDir]
  }
  return r
}

export async function start(option: string | StartOption) {
  // 初始化配置
  const opt = conbineOpt(option)
  // 扫描全部目录
  await Promise.all(opt.scanDir.map((v) => scan(v)))
  await trigger('afterScan', opt)
  // 读取配置项
  await readApplication(opt.scanDir)
  await trigger('afterEnv', opt)
  // 配置log4js
  await configLog4js()
  await trigger('afterLog', opt)
  await trigger('beforeStart', opt)
  const log = getLogger(__filename)
  log.info('[moon] - Application Start Success.')
  await trigger('afterStart', opt)
}
