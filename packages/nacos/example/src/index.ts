import { start } from 'moon-boot'
import { EnableNacosDiscovery } from '@moonboot/plugin-nacos'

@EnableNacosDiscovery
class Main {
    constructor() {
        start(__dirname)
    }
}

new Main()