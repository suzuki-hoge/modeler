export type ArrowType = 'simple' | 'generalization'

export interface ProjectEdgeData extends Record<string, unknown> {
  arrowType: ArrowType
  label: string
}

export type PageEdgeData = Record<string, unknown>
