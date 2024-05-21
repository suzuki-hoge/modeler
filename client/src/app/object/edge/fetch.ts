import { Edge } from 'reactflow'

export function fetchInitialEdges(): Edge[] {
  return [
    {
      id: '80A0C576-AAC3-4FA5-B8D7-FACE0B7D9B72',
      source: 'store',
      sourceHandle: 'center',
      target: 'item',
      targetHandle: 'center',
      type: 'class',
      markerEnd: 'v-arrow',
    },
  ]
}
