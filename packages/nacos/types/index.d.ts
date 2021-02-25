import { EventEmitter } from 'events'
export declare const EnableNacosDiscovery: ClassDecorator
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

export class NacosDiscovery {
  url: string
  namespaceId: string
  weight: number
  enabled: boolean
  healthy: boolean
  metadata: string
  clusterName: string
  serviceName: string
  groupName: string
  ephemeral: boolean
  port: string
  ip: string

  constructor(auto?: boolean)

  register(param?: NormalDiscoveryParam): Promise<string>
  unRegister(param?: NormalDiscoveryParam): Promise<string>
  modify(param?: NormalDiscoveryParam): Promise<string>
  query(param: QueryDiscoveryParam): Promise<QueryDiscoveryResult>
  detail(
    param: Pick<
      NormalDiscoveryParam,
      'namespaceId' | 'groupName' | 'ephemeral'
    > &
      Required<Pick<NormalDiscoveryParam, 'ip' | 'port' | 'serviceName'>> & {
        healthyOnly: boolean
        cluster?: string
      }
  ): Promise<QueryDiscoveryResult>
  beat(param: {
    serviceName: string
    groupName?: string
    ephemeral?: string
    beat: string
  }): Promise<string>
}

export interface NormalConfigParam {
  tenant?: string
  dataId?: string
  group?: string
}

export class NacosConfig extends EventEmitter {
  public static ConfigUpdateKey: string
  url: string
  tenant: string
  dataId: string
  group: string
  constructor(auto?: boolean)

  set config(c: string)

  get config(): string

  getConfig(r?: NormalConfigParam): Promise<string>

  listen(r?: NormalConfigParam & { config?: string }): Promise<string>

  pubish(
    r: NormalConfigParam & { content: string; type?: string }
  ): Promise<string>

  deleteConfig(r?: NormalConfigParam): Promise<string>
}
