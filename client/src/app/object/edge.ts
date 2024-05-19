import { Edge } from 'reactflow'

export const initialEdges: Edge[] = [
  // {
  //   id: '9B569E48-5AEB-48E1-B16D-B5DA570BC609',
  //   source: 'controller',
  //   target: 'store',
  //   type: 'class',
  //   markerEnd: 'logo',
  // },
  // {
  //   id: '80A0C576-AAC3-4FA5-B8D7-FACE0B7D9B72',
  //   source: 'controller',
  //   target: 'item',
  //   type: 'class',
  // },
]

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
