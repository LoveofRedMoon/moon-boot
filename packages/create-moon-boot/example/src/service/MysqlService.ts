import { MysqlTemplate } from '@moonboot/plugin-mysql'
import { Alias, Autowired, Bean, Type } from 'moon-boot'

class Developer {
  @Type(String)
  devCode!: string
}
@Bean()
export class TestService {
  @Autowired()
  mysqlTemplate!: MysqlTemplate

  test(): Promise<any> {
    return this.mysqlTemplate.query('select dev_code from xxx')
  }
}
