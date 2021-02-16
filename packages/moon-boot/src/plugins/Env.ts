import chalk from 'chalk'
import { readFileSync, stat, statSync } from 'fs-extra'
import { resolve } from 'path'
import jsYaml from 'js-yaml'

interface InfiRecrd {
  [key: string]: Record<any, InfiRecrd> | any
}

export interface Env {
  (path: string): string
  [key: string]: InfiRecrd
}

const env: Env = (function () {
  const fn: any = function (this: Env, path: string): string {
    const ps = path.split('.')
    let d: any = env
    for (let i = 0, len = ps.length; i < len; i++) {
      if (d === void 0 || d === null) {
        return ''
      }
      d = d[ps[i]]
    }
    return d === void 0 || d === null
      ? ''
      : typeof d === 'string'
      ? d
      : JSON.stringify(d)
  }
  fn.profiles = { active: 'default' }
  return fn
})()

const blank = Function.prototype

/**
 * 合并数据使用, 若为对象, 则遍历字段值进行赋值(即不会删除旧属性)
 * 若为数组, 则直接覆盖
 * @param data
 * @param newData
 */
function readAndSet(data: any, newData: any): void | any[] {
  if (Array.isArray(newData)) {
    return newData.map((value) => {
      if (value === void 0 || value === null) {
        return undefined
      }
      if (typeof value === 'object') {
        const d = { __private__: blank }
        const n = readAndSet(d, value)
        return n ? n : d
      }
      return value
    })
  } else {
    Object.entries(newData).forEach(([key, value]) => {
      if (value === void 0 || value === null) {
        return
      }
      if (typeof value === 'object') {
        if (!data[key]?.__private__) {
          data[key] = { __private__: blank }
        }
        const n = readAndSet(data[key], value)
        if (n) {
          data[key] = n
        }
        return
      }
      data[key] = value
    })
  }
}

export function readApplication(baseUrls: string[]) {
  console.log(chalk.red('[moon] - ') + chalk.greenBright('start scan env'))
  let activeProfiles = new Set(['default'])
  const all = ['application.yml', 'application.yaml']
  for (let j = baseUrls.length; j--; ) {
    for (let i = 0; i < all.length; i++) {
      const p = resolve(baseUrls[j], 'resources', all[i])
      try {
        const yaml = readFileSync(p).toString('utf-8')
        const data: any = jsYaml.load(yaml)
        readAndSet(env, data)
        const currentActive = env('profiles.active')
        if (!activeProfiles.has(currentActive)) {
          activeProfiles.add(currentActive)
          all.push(
            'application-' + currentActive + '.yaml',
            'application-' + currentActive + '.yml'
          )
        }
        console.debug(
          chalk.red('[moon] - ') +
            chalk.greenBright('read property file ' + all[i] + ' complete')
        )
      } catch (e) {}
    }
  }
  console.log(
    chalk.red('[moon] - ') +
      chalk.greenBright('active profiles: ' + [...activeProfiles].join())
  )
}

export default env
