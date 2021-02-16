import { TypeDeal } from 'moon-boot'

export function Controller(path?: string): ClassDecorator
export function Get(path?: string): MethodDecorator
export function Post(path?: string): MethodDecorator
export function Put(path?: string): MethodDecorator
export function Delete(path?: string): MethodDecorator
export function Req(): ParameterDecorator
export function Res(): ParameterDecorator
export function Path(name: string, type?: TypeDeal): ParameterDecorator
export function Query(name: string, type?: TypeDeal): ParameterDecorator
export function Header(name: string, type?: TypeDeal): ParameterDecorator
export function Body(type?: TypeDeal): ParameterDecorator
/**
 * @deprecated
 */
export function Next(): ParameterDecorator
