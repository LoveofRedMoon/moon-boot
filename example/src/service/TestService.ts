import { RedisTemplate } from '@moonboot/plugin-redis'
import { Autowired, Bean } from 'moon-boot'

@Bean()
export class TestService {
  @Autowired()
  redisTemplate!: RedisTemplate

  test() {
    return this.redisTemplate.get('abc')
  }
}
