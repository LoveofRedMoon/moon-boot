import { Redis, Cluster } from 'ioredis'
/**
 * @Bean()
 * class TestService {
 *      @Autowired()
 *      redisTemplate!: RedisTemplate
 * }
 */
export declare class RedisTemplate {
  client: Redis
}
export declare class RedisClusterTemplate {
  client: Cluster
}
