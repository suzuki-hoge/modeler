import { Edge } from 'reactflow'

import { EdgeData } from '@/app/object/edge/type'

export function fetchInitialEdges(): Edge<EdgeData>[] {
  return [
    {
      id: '80A0C576-AAC3-4FA5-B8D7-FACE0B7D9B72',
      source: 'store',
      sourceHandle: 'center',
      target: 'item',
      targetHandle: 'center',
      type: 'class',
      markerEnd: 'v-arrow',
      data: { arrowType: 'v-arrow', label: '0..*' },
    },
  ]
}
