# @moonboot/plugin-prisma

## What

> A Project support [prisma](https://www.npmjs.com/package/prisma) for `moon-boot`

## How to use

> `npm i @moonboot/plugin-prisma`

> follow by [prisma](https://www.prisma.io/docs/getting-started/setup-prisma)

> use `PrismaTemplate` in `Service` as the following example.

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
  prismaTemplate!: PrismaTemplate

  test() {
    this.prismaTemplate.client.mget('abc', 'key')
  }
}
```

### Decorator

### FAQ

Q: Why should I create `prisma/schema.prisma`?
A: Follow `Prisma`, and will simple to dev.

Q: Add to exist Datasource?
A: 
  1. create file `prisma/schema.prisma`
  2. 

### Param

1. `redis.cluster = false`
   useCluster or not, default is `false`
2. `redis...`
   The config under `redis` will pass to `new IoRedis() / new IoRedis.Cluster()`
