import { Select } from '@moonboot/plugin-mysql-mybatis'
import { RedisTemplate } from '@moonboot/plugin-redis'
import { Alias, Autowired, Bean, Schedule, Type } from 'moon-boot'
import { Snake2Camel } from '../../../packages/moon-boot/dist'
@Snake2Camel
class Developer {
  @Type(String)
  devCode!: string
}
@Bean()
export class TestService {
  @Select('select dev_code from td_m_developer limit 1')
  @Type([Array, Developer])
  test(e?: any): Promise<Developer[]> {
    console.log(e)
    throw new Error()
  }

  @Schedule('0 * * * * *')
  test2() {
  }
}
