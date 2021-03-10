const { resolve } = require('path')
module.exports = {
  files: {
    [resolve(
      __dirname,
      'src/service/MysqlService.ts'
    )]: 'src/service/MysqlService.ts',
  },
  env: {
    mysql: {
      default: '',
      remark:
        'See https://www.npmjs.com/package/mysql2#using-connection-pools For more information',
    },
    'mysql.host': {
      default: 'localhost',
      remark: 'Mysql host',
    },
    'mysql.user': {
      default: 'root',
      remark: 'Mysql username',
    },
    'mysql.password': {
      default: '',
      remark: 'Mysql password',
    },
    'mysql.database': {
      default: 'test',
      remark: 'Mysql database name',
    },
  },
}
