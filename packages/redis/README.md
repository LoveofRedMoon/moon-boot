# @moonboot/plugin-redis

## What

> A Project support [redis](https://www.npmjs.com/package/ioredis) for `moon-boot`

## How to use

> `npm i @moonboot/plugin-redis`
> Then you can use Redis with `RedisTemplate` `RedisClusterTemplate` as the following example.

```ts
// This Moudle will auto use when installed
// See project For More Information
// index.ts
import { start } from 'moon-boot'
class Main {
  constructor() {
    start(__dirname)
  }
}
new Main()
// service.ts
@Bean()
class TestService {
  @Autowired()
  redisTemplate!: RedisTemplate

  test() {
    this.redisTemplate.client.mget('abc', 'key')
  }
}
```

### Decorator

### FAQ

### Param

1. `redis.cluster = false`
   useCluster or not, default is `false`
2. `redis...`
   The config under `redis` will pass to `new IoRedis() / new IoRedis.Cluster()`
