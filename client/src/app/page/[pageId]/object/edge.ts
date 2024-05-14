import { DefaultEdgeOptions, Edge } from 'reactflow'

export const initialEdges: Edge[] = [
  {
    id: '9B569E48-5AEB-48E1-B16D-B5DA570BC609',
    source: 'controller',
    target: 'store',
  },
  {
    id: '80A0C576-AAC3-4FA5-B8D7-FACE0B7D9B72',
    source: 'controller',
    target: 'item',
  },
]

export const defaultEdgeOptions: DefaultEdgeOptions = { type: 'smoothstep' }
