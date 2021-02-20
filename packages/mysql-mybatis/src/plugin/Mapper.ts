export function Select(): MethodDecorator {
  return function (target, key, desc) {
    console.log(Reflect.getMetadata('design:paramtypes', target, key))
    console.log(Reflect.getMetadata('design:returntype', target, key))
  }
}
