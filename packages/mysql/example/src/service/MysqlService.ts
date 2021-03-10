import { MysqlTemplate } from '@moonboot/plugin-mysql'
import { Autowired, Bean } from 'moon-boot'

@Bean()
export class MysqlService {
  @Autowired()
  mysqlTemplate!: MysqlTemplate

  async test() {
    return this.mysqlTemplate.query('select 1 from dual')
  }
}
