import fs, { existsSync, readdirSync } from 'fs-extra'
import { resolve } from 'path'

/**
 * 默认扫描以下路径
 * 1. 指定目录
 * @param p 扫描路径
 */
export async function scan(p: string) {
  return scanDir(p)
}

export async function scanDir(p: string) {
  const all = await fs.readdir(p)
  await Promise.all(
    all.map(async (f) => {
      const pa = resolve(p, f)
      const s = await fs.stat(pa)
      if (s.isDirectory()) {
        return scan(pa)
      } else if (s.isFile() && f.match(/\.(js|ts|tsx)$/i)) {
        return import(pa)
      }
    })
  )
}

export async function scanNode() {
  let p = resolve(__dirname)
  while (!existsSync(resolve(p, 'node_modules'))) {
    const a = resolve(p, '..')
    if (a === p) {
      throw new Error('[moon] - cannot find node_modules')
    }
    p = a
  }
  try {
    const dirs = readdirSync(resolve(p, 'node_modules', '@moonboot'))
    return await Promise.all(dirs.map((v) => import(`@moonboot/${v}`)))
  } catch {}
}
