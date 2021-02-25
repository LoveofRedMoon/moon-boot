import { Bean, Condition, getBeanInstance, Value } from 'moon-boot'
import md5 from 'blueimp-md5'
import os from 'os'
import { EventEmitter } from 'events'
import axios from 'axios'

export const EnableNacosDiscovery: ClassDecorator = function (target) {
  getBeanInstance(NacosDiscovery)
}

function getIPAdress(): string {
  var interfaces = os.networkInterfaces()
  const list = Object.values(interfaces).flat(1)
  for (var i = list.length; i--; ) {
    var alias = list[i]
    if (
      alias &&
      alias.family === 'IPv4' &&
      alias.address !== '127.0.0.1' &&
      !alias.internal
    ) {
      return alias.address
    }
  }
  return '127.0.0.1'
}

export interface NormalDiscoveryParam {
  ip?: string
  port?: string
  namespaceId?: string
  weight?: number
  enabled?: boolean
  healthy?: boolean
  metadata?: string
  clusterName?: string
  serviceName?: string
  groupName?: string
  ephemeral?: boolean
}
export interface QueryDiscoveryParam {
  clusters?: string
  serviceName: string
  groupName?: string
  namespaceId?: string
  healthyOnly?: boolean
}
export interface QueryDetailDiscoveryResult {
  valid: boolean
  marked: boolean
  instanceId: string
  port: number
  ip: string
  weight: number
  metadata: any
  clusterName: string
}
export interface QueryDiscoveryResult {
  dom: string
  cacheMillis: number
  useSpecifiedURL: boolean
  hosts: Array<Omit<QueryDetailDiscoveryResult, 'clusterName'>>
  checksum: string
  lastRefTime: number
  env: string
  clusters: string
}

@Condition((env) => !!env('server.port') && !!env('nacos.discovery'))
@Bean()
export class NacosDiscovery {
  @Value('nacos.discovery.url')
  url!: string

  @Value('nacos.discovery.namespaceId:')
  namespaceId!: string

  @Value('nacos.discovery.weight:1', { type: Number })
  weight!: number

  @Value('nacos.discovery.enabled:true', { type: Boolean })
  enabled!: boolean

  @Value('nacos.discovery.healthy:true', { type: Boolean })
  healthy!: boolean

  @Value('nacos.discovery.metadata:')
  metadata!: string

  @Value('nacos.discovery.clusterName:')
  clusterName!: string

  @Value('nacos.discovery.serviceName')
  serviceName!: string

  @Value('nacos.discovery.groupName:')
  groupName!: string

  @Value('nacos.discovery.ephemeral:false', { type: Boolean })
  ephemeral!: boolean

  @Value('server.port')
  port!: string

  @Value('nacos.discovery.ip:')
  ip!: string

  private _beatflag: boolean = false

  constructor(auto = true) {
    if (auto) {
      this._listen()
    }
  }

  private async _listen() {
    await this.register()
    process.on('beforeExit', async () => {
      this._beatflag = false
      await this.unRegister()
    })
    this._beatflag = true
    this._beat()
  }
  private async _beat() {
    if (this._beatflag) {
      this.beat({
        serviceName: this.serviceName,
        beat: JSON.stringify({}),
      }).then(this._beat.bind(this))
    }
  }

  async register(param: NormalDiscoveryParam = {}): Promise<string> {
    return axios
      .post(
        this.url + '/nacos/v1/ns/instance',
        {},
        {
          params: Object.assign(
            {},
            {
              ip: this.ip || getIPAdress(),
              port: this.port,
              namespaceId: this.namespaceId,
              weight: this.weight,
              enabled: this.enabled,
              healthy: this.healthy,
              metadata: this.metadata,
              clusterName: this.clusterName,
              serviceName: this.serviceName,
              groupName: this.groupName,
              ephemeral: this.ephemeral,
            },
            param
          ),
        }
      )
      .then((v) => v.data)
  }
  async unRegister(param: NormalDiscoveryParam = {}): Promise<string> {
    return axios
      .delete(this.url + '/nacos/v1/ns/instance', {
        params: Object.assign(
          {},
          {
            ip: this.ip || getIPAdress(),
            port: this.port,
            namespaceId: this.namespaceId,
            clusterName: this.clusterName,
            serviceName: this.serviceName,
            groupName: this.groupName,
            ephemeral: this.ephemeral,
          },
          param
        ),
      })
      .then((v) => v.data)
  }
  async modify(param: NormalDiscoveryParam = {}): Promise<string> {
    return axios
      .put(
        this.url + '/nacos/v1/ns/instance',
        {},
        {
          params: Object.assign(
            {},
            {
              ip: this.ip || getIPAdress(),
              port: this.port,
              serviceName: this.serviceName,
            },
            param
          ),
        }
      )
      .then((v) => v.data)
  }
  async query(param: QueryDiscoveryParam): Promise<QueryDiscoveryResult> {
    return axios
      .get(this.url + '/nacos/v1/ns/instance/list', { params: param })
      .then((v) => v.data)
  }
  async detail(
    param: Pick<
      NormalDiscoveryParam,
      'namespaceId' | 'groupName' | 'ephemeral'
    > &
      Required<Pick<NormalDiscoveryParam, 'ip' | 'port' | 'serviceName'>> & {
        healthyOnly: boolean
        cluster?: string
      }
  ): Promise<QueryDiscoveryResult> {
    return axios
      .get(this.url + '/nacos/v1/ns/instance/list', { params: param })
      .then((v) => v.data)
  }
  async beat(param: {
    serviceName: string
    groupName?: string
    ephemeral?: string
    beat: string
  }): Promise<string> {
    return axios
      .put(
        '/nacos/v1/ns/instance/beat',
        {},
        {
          params: param,
        }
      )
      .then((v) => v.data)
  }
}

export interface NormalConfigParam {
  tenant?: string
  dataId?: string
  group?: string
}

@Bean()
export class NacosConfig extends EventEmitter {
  public static ConfigUpdateKey = 'configUpdate'
  @Value('nacos.config.url')
  url!: string

  @Value('nacos.config.tenant')
  tenant!: string

  @Value('nacos.config.dataId')
  dataId!: string

  @Value('nacos.config.group')
  group!: string

  private _config: string = ''

  constructor(auto = true) {
    super()
    if (auto) {
      this._listen()
    }
  }

  private _listen() {
    this.listen()
      .then((v) => {
        if (v) {
          return this.getConfig().then((v) => {
            this.config = v
          })
        }
      })
      .then(this._listen.bind(this))
  }

  set config(c: string) {
    this.emit(NacosConfig.ConfigUpdateKey, c, this._config)
    this._config = c
  }

  get config() {
    return this._config
  }

  async getConfig(r: NormalConfigParam = {}): Promise<string> {
    return axios
      .get(this.url + '/nacos/v1/cs/configs', {
        params: Object.assign(
          { tenant: this.tenant, dataId: this.dataId, group: this.group },
          r
        ),
      })
      .then((v) => v.data)
  }

  async listen(
    r: NormalConfigParam & { config?: string } = {}
  ): Promise<string> {
    const tenant = r.tenant ?? this.tenant
    return axios
      .post(this.url + '/nacos/v1/cs/configs/listener', '', {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Long-Pulling-Timeout': '30000',
        },
        params: {
          'Listening-Configs': `${r.dataId ?? this.dataId}${String.fromCharCode(
            2
          )}${r.group ?? this.group}${String.fromCharCode(2)}${md5(
            this.config
          )}${
            tenant ? String.fromCharCode(2) + tenant : ''
          }${String.fromCharCode(1)}`,
        },
      })
      .then((v) => v.data)
  }

  async pubish(
    r: NormalConfigParam & { content: string; type?: string }
  ): Promise<string> {
    return axios
      .post(this.url + '/nacos/v1/cs/configs', {
        params: Object.assign(
          { tenant: this.tenant, dataId: this.dataId, group: this.group },
          r
        ),
      })
      .then((d) => {
        return d.data
      })
  }

  async deleteConfig(r: NormalConfigParam = {}): Promise<string> {
    return axios
      .delete(this.url + '/nacos/v1/cs/configs', {
        params: Object.assign(
          { tenant: this.tenant, dataId: this.dataId, group: this.group },
          r
        ),
      })
      .then((d) => {
        return d.data
      })
  }
}
