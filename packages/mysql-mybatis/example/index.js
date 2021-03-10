const { resolve } = require('path')
const data = require('@moonboot/plugin-mysql/example')
module.exports = {
  files: {
    [resolve(
      __dirname,
      'src/service/MysqlMybatisService.ts'
    )]: 'src/service/MysqlMybatisService.ts',
  },
  env: {
    ...data.env,
  },
}
