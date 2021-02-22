export type MYBATIS_SQL =
  | string
  | ((
      data: any,
      operator: { trim; where; set; choose }
    ) => string | Array<string | undefined | null>)

export function Select(sql: MYBATIS_SQL): MethodDecorator
