import { Edge } from 'reactflow'

import { ArrowType, PageEdgeData, ProjectEdgeData } from '@/app/_object/edge/type'

export function allocateEdgeId(): string {
  return crypto.randomUUID()
}

export function createEdge(
  id: string,
  src: string,
  dst: string,
  arrowType: ArrowType,
  label: string,
): Edge<ProjectEdgeData> {
  return {
    id,
    source: src,
    sourceHandle: 'center',
    target: dst,
    targetHandle: 'center',
    markerEnd: arrowType,
    data: { arrowType, label },
  }
}

export function extractPageEdge(edge: Edge<ProjectEdgeData>): Edge<PageEdgeData> {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    markerEnd: edge.markerEnd,
    data: {},
  }
}

interface Change {
  source?: string
  target?: string
  arrowType?: ArrowType
  label?: string
}

export function updateEdge(edge: Edge<ProjectEdgeData>, change: Change): Edge<ProjectEdgeData> {
  if (change.source) edge.source = change.source
  if (change.target) edge.target = change.target
  if (change.arrowType) {
    edge.markerEnd = change.arrowType
    edge.data!.arrowType = change.arrowType
  }
  if (change.label) edge.data!.label = change.label
  return edge
}
