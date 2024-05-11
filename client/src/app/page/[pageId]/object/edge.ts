import { DefaultEdgeOptions, Edge } from 'reactflow'

export const initialEdges: Edge[] = [
  {
    id: '9B569E48-5AEB-48E1-B16D-B5DA570BC609',
    source: '5d101163-1039-4e3e-b362-5fa72efec34d',
    target: '58c85fd3-863b-4c49-bb9d-99247ecb8a9c',
  },
  {
    id: '80A0C576-AAC3-4FA5-B8D7-FACE0B7D9B72',
    source: '5d101163-1039-4e3e-b362-5fa72efec34d',
    target: 'c6f00826-c3a2-4239-bcca-2c1bad3f40f3',
  },
]

export const defaultEdgeOptions: DefaultEdgeOptions = { type: 'smoothstep' }
