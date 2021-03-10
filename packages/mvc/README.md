# @moonboot/plugin-express

## What

> A Project support rest module for `moon-boot`

## How to use

> `npm i @moonboot/plugin-express`
> Then you can create controller as the following example.

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

#### With npx

```bash
$ npx create-moon-boot use plugin-express
```

### Decorator

1. `@Controller`
   To Mark One Class is Controller.

   ```ts
   @Controller()
   class TestController {}
   ```

   > Param: basePath, must startsWith `/`, default: `'/'`

2. `@Get` `@Post` `@Delete` `@Put`
   To Mark One Method is Route Method

   ```ts
   @Controller()
   class TestController {
     @Get('test/:id')
     test(@Body(UserParam) userParam: UserParam) {
       return 'success'
     }
   }
   ```

   > Param: followingPath, `path.resolve(ControllerPath, MethodPath)`, default: `''`

3. `@Req` `@Res` `@Next`
   Some simple Param For Express

   ```ts
   @Controller()
   class TestController {
     @Get('test/:id')
     test(
       @Req() req: Express.Request,
       @Res() res: Express.Response,
       @Next() next: Express.Next
     ) {
       res.json({ success: true })
     }
   }
   ```

   > Tip: !!! When you use param `@Res`, plugin will not deal method return value.

4. `@Path` === `req.param`
   Get Param With Express param

   ```ts
   @Controller()
   class TestController {
     @Get('test/:id')
     test(@Path('id') id: string) {
       return 'success'
     }

     // When you pass one constructor with the second param, Method will auto transform data
     @Post('test/:id')
     test(@Path('id', Number) id: number) {
       return 'success'
     }
   }
   ```

5. `@Query` === `req.query`
   Get Param With Express query params

   example as `@Path`

6. `@Header` === `req.header`
   Get Param With Express header params

   example as `@Path`

7. `@Body` === `req.body`
   Get Param With Express body

   ```ts
   class User {
     name?: string
   }
   @Controller()
   class TestController {
     @Get('test')
     test(@Body() body: any) {
       return 'success'
     }

     // When you pass one constructor with the first param, Method will auto transform data
     @Post('test')
     test(@Body(User) body: User) {
       return 'success'
     }
   }
   ```

### FAQ

### Param

1. `server.port = 8080`
   The Port which express will listen
