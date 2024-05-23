import { Edge } from 'reactflow'

import { ArrowType } from '@/app/component/marker/Arrows'
import { EdgeData } from '@/app/object/edge/type'

export function allocateEdgeId(): string {
  return crypto.randomUUID()
}

export function createEdge(id: string, src: string, dst: string, arrowType: ArrowType, label: string): Edge<EdgeData> {
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

interface Change {
  src?: string
  dst?: string
  arrowType?: ArrowType
  label?: string
}
export function updateEdge(edge: Edge<EdgeData>, change: Change): Edge<EdgeData> {
  if (change.src) edge.source = change.src
  if (change.dst) edge.target = change.dst
  if (change.arrowType) {
    edge.markerEnd = change.arrowType
    edge.data!.arrowType = change.arrowType
  }
  if (change.label) edge.data!.label = change.label
  return edge
}
