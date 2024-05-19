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

export function allocateNodeId(): string {
  return crypto.randomUUID()
}

export function createNode(id: string, x: number, y: number): Node<NodeData> {
  return {
    id,
    type: 'class',
    position: { x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) },
    data: { icon: 'C', name: '', properties: [], methods: [] },
  }
}

export function insertProperty(data: NodeData, property: string, n: number): NodeData {
  const properties = [...data.properties.slice(0, n + 1), property, ...data.properties.slice(n + 1)]
  return { ...data, properties }
}

export function updateProperty(data: NodeData, property: string, n: number): NodeData {
  const properties = data.properties.map((m, i) => (i === n ? property : m))
  return { ...data, properties }
}

export function deleteProperty(data: NodeData, n: number): NodeData {
  const properties = data.properties.filter((_, i) => i !== n)
  return { ...data, properties }
}

export function insertMethod(data: NodeData, method: string, n: number): NodeData {
  const methods = [...data.methods.slice(0, n + 1), method, ...data.methods.slice(n + 1)]
  return { ...data, methods }
}

export function updateMethod(data: NodeData, method: string, n: number): NodeData {
  const methods = data.methods.map((m, i) => (i === n ? method : m))
  return { ...data, methods }
}

export function deleteMethod(data: NodeData, n: number): NodeData {
  const methods = data.methods.filter((_, i) => i !== n)
  return { ...data, methods }
}
