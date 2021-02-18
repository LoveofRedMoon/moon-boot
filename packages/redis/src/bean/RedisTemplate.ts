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
export class RedisTemplate {
  client: Redis
  constructor() {
    this.client = new IoRedis(JSON.parse(env('redis')))
  }
  close() {
    this.client.disconnect()
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
export class RedisClusterTemplate {
  client: Cluster
  constructor() {
    this.client = new IoRedis.Cluster(JSON.parse(env('redis')))
  }
  close() {
    this.client.disconnect()
  }
}
