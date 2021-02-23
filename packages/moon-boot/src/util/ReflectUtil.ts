export function getReflectMetadataArr(
  metadataKey: any,
  target: Object,
  propertyKey?: string | symbol
): any[] {
  if (propertyKey) {
    const arr: any[] | undefined = Reflect.getMetadata(
      metadataKey,
      target,
      propertyKey
    )
    if (arr) {
      return arr
    } else {
      const r = []
      Reflect.defineMetadata(metadataKey, r, target, propertyKey)
      return r
    }
  } else {
    const arr: any[] | undefined = Reflect.getMetadata(metadataKey, target)
    if (arr) {
      return arr
    } else {
      const r = []
      Reflect.defineMetadata(metadataKey, r, target)
      return r
    }
  }
}
