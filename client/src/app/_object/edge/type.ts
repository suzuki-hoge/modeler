export type ArrowType = 'simple' | 'generalization'

export interface ProjectEdgeData {
  arrowType: ArrowType
  label: string
}

export type PageEdgeData = Record<string, never>
