export type MYBATIS_SQL =
  | string
  | ((
      data: any,
      operator: {
        trim: (
          param: {
            prefix?: string | undefined
            prefixOverrides?: string | string[] | undefined
            suffix?: string | undefined
            suffixOverrides?: string | string[] | undefined
          },
          ...statements: Array<string | undefined | null>
        ) => string
        where: (...statements: Array<string | undefined | null>) => string
        set: (...statements: Array<string | undefined | null>) => string
        choose: (...statements: Array<string | undefined | null>) => string
      }
    ) => string | Array<string | undefined | null>)

export function Select(sql: MYBATIS_SQL): MethodDecorator
