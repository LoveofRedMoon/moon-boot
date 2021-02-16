import fs from 'fs-extra'
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
