export interface ClassFormat {
  dependencies: classDependency[]
  attributes: ClassAttribute[]
  method?: ClassMethod;
}

export interface classDependency {
  name: string
  type: string
}

export interface ClassAttribute {
  name: string
  type: 'string'|'number'|'boolean'|'null'|'undefined'|'bigint'|string
}

export interface ClassMethod {
  name: string
  parameters: ClassAttribute[]
}

export const dependencyGraph: Record<string, ClassFormat> = {}