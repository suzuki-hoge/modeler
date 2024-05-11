import { Node } from 'reactflow'

export interface NodeData {
  icon: string
  name: string
  properties: string[]
  methods: string[]
}

export const initialNodes: Node<NodeData>[] = [
  {
    id: '5d101163-1039-4e3e-b362-5fa72efec34d',
    type: 'class',
    position: { x: 0, y: 0 },
    data: { icon: 'C', name: 'ItemController', properties: [], methods: ['+ apply()'] },
  },
  {
    id: '58c85fd3-863b-4c49-bb9d-99247ecb8a9c',
    type: 'class',
    position: { x: -75, y: 100 },
    data: { icon: 'S', name: 'ItemStore', properties: [], methods: ['+ save(item: Item)'] },
  },
  {
    id: 'c6f00826-c3a2-4239-bcca-2c1bad3f40f3',
    type: 'class',
    position: { x: 75, y: 150 },
    data: { icon: 'DC', name: 'Item', properties: ['- t: T'], methods: ['+ get(): T', '- set(t: T)'] },
  },
]
