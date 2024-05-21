import { Edge } from 'reactflow'

export function allocateEdgeId(): string {
  return crypto.randomUUID()
}

export function createEdge(id: string, src: string, dst: string): Edge {
  return {
    id,
    source: src,
    sourceHandle: 'center',
    target: dst,
    targetHandle: 'center',
  }
}
