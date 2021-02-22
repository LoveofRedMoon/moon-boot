import mysql from 'mysql2'
import type { Pool } from 'mysql2/promise'
import { env, Bean, Condition, getLogger } from 'moon-boot'
const log = getLogger(__filename)

@Condition((env) => {
  const config = env('mysql')
  if (!config) {
    log.error('[moon] when use mysql the property mysql is necessary')
    return false
  }
})
@Bean()
export class MysqlTemplate {
  private _pool: Pool
  get pool() {
    return this._pool
  }
  get query() {
    return this._pool.query.bind(this._pool)
  }
  get execute() {
    return this._pool.execute.bind(this._pool)
  }
  get getConnection() {
    return this._pool.getConnection.bind(this._pool)
  }
  get on() {
    return this._pool.on.bind(this._pool)
  }
  get end() {
    return this._pool.end.bind(this._pool)
  }
  constructor() {
    this._pool = mysql.createPool(JSON.parse(env('mysql'))).promise()
  }
}
