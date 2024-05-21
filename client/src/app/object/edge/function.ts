import { Edge } from 'reactflow'

import { ArrowType } from '@/app/component/marker/Arrows'

export function allocateEdgeId(): string {
  return crypto.randomUUID()
}

export function createEdge(id: string, src: string, dst: string, markerEnd: ArrowType): Edge {
  return {
    id,
    source: src,
    sourceHandle: 'center',
    target: dst,
    targetHandle: 'center',
    markerEnd,
  }
}
