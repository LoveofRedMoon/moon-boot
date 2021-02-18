# moon-boot

## What

> A Project followed by SpringBoot For Nodejs

## Why

1. `SpringBoot` is the most popular `Microservice` Framework.
2. By `IOC`, It's simply to organize your project structure.

## How to use

```js
const { start } = require('moon-boot')
start(__dirname)
```

```js
// For Class Mode
const { start } = require('moon-boot')
class Main {
  constructor() {
    start(__dirname)
  }
}
new Main()
```

> We suggest the second way to use this. For `Decorator` is easy to use with less code, is right?

### Decorator

1. LifeCycleHooks
   `AfterScan`
   `AfterEnv`
   `AfterLog`
   `BeforeStart`
   `AfterStart`
2. `@Value`
   To load env as Param

   ```ts
   @Bean()
   class TestService {
     @Value('profiles.active')
     activeProfile!: string

     // Give a placeholder
     @Value('server.port:8080')
     activeProfile!: string

     // Transform Type
     @Value('someData:{"name":"anc"}', { type: User })
     someData!: User
   }
   ```

3. `@Autowired`
   To load Beans

   ```ts
   @Bean()
   class TestService {
     @Autowired()
     test2Service: Test2Service

     @Autowired('test2Service')
     otherName: Test2Service
   }
   ```

4. `@Bean`
   To Register Bean

   > !!! difference: When Bean have not be used, it will not load

   ```ts
   @Bean('otherName')
   class TestService {}
   ```

5. `@BeforeBean`
   To run before Bean register
   ```ts
   @BeforeBean((env) => {
     console.log(env)
   })
   @Bean('otherName')
   class TestService {}
   ```
6. `@Condition`
   To run before Bean register, will no be load when return `false`

   ```ts
   @Condition((env) => {
     return '8080' === env('server.port')
   })
   @Bean('otherName')
   class TestService {}
   ```

### Plugins

> How to build plugins? 
> See `@moon-boot/plugin-express` as example
> If you want register, you must provide `bean` to be scaned from `index`

1. `Rest` => `@moonboot/plugin-express`
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
   // controller.ts
   @Controller()
   class TestController {
     @Get('test/:id')
     test(@Body(UserParam) userParam: UserParam) {
       return 'success'
     }
   }
   ```
2. `Redis` => `@moonboot/plugin-redis`
   ```ts
   ```

### FAQ

Q: Why use `Decorator`
A: Simple

Q: Why not `nestjs`
A: It works well, but in some case, It's too big.

### LifeCycle

1. `Scan`
   We will scan the directory you provide, and the `node_modules` align with package `moon-boot` and startsWith `@moon-boot/`
2. Hook `AfterScan`
3. `Env`
   We will scan the directory you provide, to find `application.yma?l`
4. Hook `AfterEnv`
5. `Log`
   Load `log4js`
6. Hook `AfterLog`
7. Hook `BeforeStart`
8. Hook `AfterStart`
