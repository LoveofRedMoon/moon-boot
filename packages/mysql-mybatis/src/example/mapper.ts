import { Bean } from 'moon-boot'
import { Select } from '../plugin/mapper'

@Bean()
export class TestMapper {
  @Select()
  async test(username: any): Promise<number> {
    // returns default value when execute fail
    // Attention!!!  must return Promise For execute is async
    throw new Error('execute fail fallback')
  }
}
