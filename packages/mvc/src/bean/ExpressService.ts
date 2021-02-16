import { Bean, BeforeStart, StartOpt } from 'moon-boot'
import { resolveController } from '../plugins/Mvc'
export class ExpressService {
  @BeforeStart()
  beforeStart(opt: StartOpt) {
    resolveController()
  }
}
