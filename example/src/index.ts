import { start } from 'moon-boot'

class Main {
  constructor() {
    start(__dirname)
  }
  test() {
    console.log('---schedule test')
  }
}

new Main()
