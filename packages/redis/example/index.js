const { resolve } = require('path')
module.exports = {
  files: {
    [resolve(
      __dirname,
      'src/service/RedisService.ts'
    )]: 'src/service/RedisService.ts',
  },
  env: {
    redis: {
      remark: 'See https://www.npmjs.com/package/ioredis for more information.',
    },
    'redis.cluster': {
      default: false,
      remark: 'use redis for cluster mode',
    },
  },
}
