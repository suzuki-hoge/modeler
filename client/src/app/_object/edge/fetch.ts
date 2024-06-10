import { Edge } from 'reactflow'

import { EdgeData } from '@/app/_object/edge/type'

export function fetchInitialEdges(): Edge<EdgeData>[] {
  return [
    {
      id: '92870696-c091-41c8-b5e7-28a1beaebc85',
      source: 'controller',
      sourceHandle: 'center',
      target: 'usecase',
      targetHandle: 'center',
      type: 'class',
      markerEnd: 'simple',
      data: { arrowType: 'simple', label: '0..1' },
    },
    {
      id: '80a0c576-aac3-4fa5-b8d7-face0b7d9b72',
      source: 'store',
      sourceHandle: 'center',
      target: 'item',
      targetHandle: 'center',
      type: 'class',
      markerEnd: 'simple',
      data: { arrowType: 'simple', label: '0..*' },
    },
  ]
}
