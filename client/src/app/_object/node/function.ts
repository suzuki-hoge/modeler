import { Node } from 'reactflow'

import { NodeData, NodeIcon } from '@/app/_object/node/type'

export function allocateNodeId(): string {
  return crypto.randomUUID()
}

export function getIcon(iconId: string, icons: NodeIcon[]): NodeIcon {
  return icons.find((icon) => icon.id === iconId) || icons.find((icon) => icon.id === 'default')!
}

export function createNode(id: string, x: number, y: number, name: string): Node<NodeData> {
  return {
    id,
    type: 'class',
    position: { x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) },
    data: { iconId: 'default', name, properties: [], methods: [] },
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
