import { Node } from 'reactflow'

export interface NodeData {
  icon: string
  name: string
  properties: string[]
  methods: string[]
}

export const initialNodes: Node<NodeData>[] = [
  {
    id: 'controller',
    type: 'class',
    position: { x: 0, y: 0 },
    data: { icon: 'C', name: 'ItemController', properties: [], methods: ['apply()'] },
  },
  {
    id: 'store',
    type: 'class',
    position: { x: -75, y: 100 },
    data: { icon: 'S', name: 'ItemStore', properties: [], methods: ['save(item: Item)'] },
  },
  {
    id: 'item',
    type: 'class',
    position: { x: 75, y: 150 },
    data: {
      icon: 'DC',
      name: 'Item',
      properties: ['t: T', 'cached: Boolean'],
      methods: ['get(): T', 'set(t: T)'],
    },
  },
]

export function createNode(x: number, y: number): Node<NodeData> {
  return {
    id: crypto.randomUUID(),
    type: 'class',
    position: { x: x, y: y },
    data: { icon: 'C', name: '', properties: [], methods: [] },
  }
}
