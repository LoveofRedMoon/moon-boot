const { resolve } = require('path')
module.exports = {
  files: {
    [resolve(__dirname, 'src/index.ts')]: 'src/index.ts',
  },
  env: {
    'nacos.discovery.url': {
      required: true,
      remark: 'nacos discovery url, like http://1.1.1.1:8848',
    },
    'nacos.discovery.namespaceId': {
      default: "''",
      remark: 'nacos discovery namespaceId',
    },
    'nacos.discovery.weight': {
      default: 1,
      remark: 'nacos discovery service weight',
    },
    'nacos.discovery.enabled': {
      default: true,
      remark: 'nacos discovery service is enabled',
    },
    'nacos.discovery.healthy': {
      default: true,
      remark: 'nacos discovery service is healthy',
    },
    'nacos.discovery.metadata:': {
      default: "''",
      remark: 'unknown',
    },
    'nacos.discovery.clusterName': {
      default: "''",
      remark: 'nacos discovery cluster name',
    },
    'nacos.discovery.serviceName': {
      default: "''",
      remark: 'nacos discovery service name',
    },
    'nacos.discovery.groupName:': {
      default: "''",
      remark: 'nacos discovery group name',
    },
    'nacos.discovery.ephemeral': {
      default: false,
      remark: 'nacos discovery instance is ephemeral',
    },
    'server.port:8080': {
      default: 8080,
      remark: 'mvc appliction listen port',
    },
    'nacos.discovery.ip': {
      default: 'get ip from Nodejs os module',
      remark: 'nacos discovery tell nacos your instance ip',
    },
    'nacos.config.url': {
      required: true,
      remark: 'nacos config url, like http://1.1.1.1:8848',
    },
    'nacos.config.tenant': { default: '', remark: 'nacos config tenant' },
    'nacos.config.dataId': {
      required: true,
      remark: 'nacos config dataId',
    },
    'nacos.config.group': {
      default: 'DEFAULT_GROUP',
      remark: 'nacos config group name',
    },
  },
}
