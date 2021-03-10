import { Select } from '@moonboot/plugin-mysql-mybatis'
import { Alias, Autowired, Bean, Type } from 'moon-boot'

class Developer {
  @Type(String)
  devCode!: string
}
@Bean()
export class TestService {
  @Select('select dev_code from td_m_developer limit 1')
  @Type([Array, Developer])
  test(e?: any): Promise<Developer[]> {
    console.log(e);
    throw new Error()
  }
}
