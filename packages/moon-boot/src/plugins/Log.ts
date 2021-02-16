import log4js from 'log4js'
import env from './Env'

export function configLog4js() {
  const config = env('log4js')
  if (config) {
    log4js.configure(JSON.parse(env('log4js')))
  } else {
    log4js.configure({
      appenders: {
        file: {
          type: 'file',
          filename: 'app.log',
        },
        out: {
          type: 'stdout',
        },
      },
      categories: {
        default: {
          appenders: ['out'],
          level: 'info',
        },
      },
    })
  }
}

export function getLogger(path: string) {
  const g = path.split(/[\\\/]/g)
  const a: string[] = []
  if (g.length) {
    a.unshift(g.pop()!.replace(/\.[^\.]*$/g, ''))
  }
  for (let i = 0; i < 3; i++) {
    if (g.length) {
      a.unshift(g.pop()!.substr(0, 3).toLowerCase())
    }
  }
  while (g.length) {
    a.unshift(g.pop()!.substr(0, 1).toLowerCase())
  }
  return log4js.getLogger(a.join('.'))
}
