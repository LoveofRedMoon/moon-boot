import { Pool } from 'mysql2/promise'
import { EventEmitter } from 'events'
/**
 * @Bean()
 * class TestService {
 *      @Autowired()
 *      mysqlTemplate!: MysqlTemplate
 * }
 */
export declare class MysqlTemplate {
  pool: Pool
  execute: Pool['execute']
  getConnection: Pool['getConnection']
  on: Pool['on']
  end: Pool['end']
  query: Pool['query']
}
