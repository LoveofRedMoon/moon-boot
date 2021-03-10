import { RedisTemplate } from '@moonboot/plugin-redis'
import { Autowired, Bean } from 'moon-boot'

@Bean()
export class RedisService {
  @Autowired()
  redisTemplate!: RedisTemplate

  async test() {
    return this.redisTemplate.hget('a','b')
  }
}
