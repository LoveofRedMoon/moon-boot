# @moonboot/plugin-mysql-mybatis

## What

> A Project support Simple Sql For `moon-boot` Align with `@moonboot/plugin-mysql`

## How to use

> `npm i @moonboot/plugin-mysql-mybatis`

> Then you can use mysql with `@Select` as the following example.

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
  @Select('select dev_code from td_m_developer limit 1')
  @Type([Array, Developer])
  test(e?: any): Promise<Developer[]> {
    // Fallback Call
    console.log(e);
    throw new Error()
  }
}
```

#### With npx
```bash
$ npx create-moon-boot use plugin-mysql-mybatis
```

### Decorator

### FAQ

### Param

