import IoRedis, { Cluster, Redis } from 'ioredis'
import { env, Bean, Condition, getLogger } from 'moon-boot'
const log = getLogger(__filename)

@Condition((env) => {
  const config = env('redis')
  if (!config) {
    log.error('[moon] when use redis the property redis is necessary')
    return false
  }

  const cluster = env.redis?.cluster
  if (cluster) {
    log.error('[moon] when use redis the property redis.cluster must be false')
    return false
  }
})
@Bean()
export class RedisTemplate extends IoRedis {
  constructor() {
    super(JSON.parse(env('redis')))
  }
}

@Condition((env) => {
  const cluster = env('redis.cluster')
  if (!cluster) {
    log.error('[moon] when use redis the property redis.cluster must be true')
    return false
  }
})
@Bean()
export class RedisClusterTemplate extends IoRedis.Cluster {
  constructor() {
    super(JSON.parse(env('redis')))
  }
}
