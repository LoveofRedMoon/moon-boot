# @moonboot/plugin-mysql

## What

> A Project support [mysql2](https://www.npmjs.com/package/mysql2) for `moon-boot`

## How to use

> `npm i @moonboot/plugin-mysql`

> Then you can use mysql with `MysqlTemplate` as the following example.

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
  mysqlTemplate!: MysqlTemplate

  test() {
    this.mysqlTemplate.query('select 1 from dual')
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
