const { resolve } = require('path')
module.exports = {
  files: {
    [resolve(
      __dirname,
      'src/controller/TestController.ts'
    )]: 'src/controller/TestController.ts',
  },
  env: {
    'server.port': {
      default: '8080',
      remark: 'listen port',
    },
  },
}
