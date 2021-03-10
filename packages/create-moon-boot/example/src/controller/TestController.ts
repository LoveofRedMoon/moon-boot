import { Controller, Get } from '@moonboot/plugin-express'

@Controller()
export class TestController {
  @Get('test')
  async test() {
    return { success: true }
  }
}
