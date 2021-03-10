# @moonboot/plugin-redis

## What

> A Project support [nacos](https://nacos.io/zh-cn/docs/what-is-nacos.html) for `moon-boot`

## How to use

> `npm i @moonboot/plugin-nacos`
> Then you can use nacos with `EnableNacosDiscovery` `NacosDiscovery` `NacosConfig` as the following example.

```ts
// This Moudle will auto use when installed
// See project For More Information
// index.ts
import { start } from 'moon-boot'
@EnableNacosDiscovery
class Main {
  constructor() {
    start(__dirname)
  }
}
new Main()
```

### Decorator

### FAQ

### Param

