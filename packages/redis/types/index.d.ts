import IoRedis from 'ioredis'
/**
 * @Bean()
 * class TestService {
 *      @Autowired()
 *      redisTemplate!: RedisTemplate
 * }
 */
export declare class RedisTemplate extends IoRedis {}
export declare class RedisClusterTemplate extends IoRedis.Cluster {}
