import { Node, XYPosition } from 'reactflow'

import { NodeHeader, NodeIcon, PageNodeData, ProjectNodeData } from '@/app/_object/node/type'

export function allocateNodeId(): string {
  return crypto.randomUUID()
}

export function getIcon(iconId: string, icons: NodeIcon[]): NodeIcon {
  return icons.find((icon) => icon.id === iconId) || icons.find((icon) => icon.id === 'default')!
}

export function createProjectNode(id: string, name: string): Node<ProjectNodeData> {
  return {
    id,
    type: 'class',
    position: { x: 0, y: 0 },
    data: { iconId: 'default', name, properties: [], methods: [] },
  }
}

export function extractPageNode(node: Node<ProjectNodeData>, position: XYPosition): Node<PageNodeData> {
  return { id: node.id, type: 'class', position, data: {} }
}

export function extractNodeHeader(node: Node<ProjectNodeData>): NodeHeader {
  return { id: node.id, iconId: node.data.iconId, name: node.data.name }
}

export function expandToPageNode(header: NodeHeader, position: XYPosition): Node<PageNodeData> {
  return { id: header.id, type: 'class', position, data: {} }
}

export function insertProperty(data: ProjectNodeData, property: string, n: number): ProjectNodeData {
  const properties = [...data.properties.slice(0, n + 1), property, ...data.properties.slice(n + 1)]
  return { ...data, properties }
}

export function updateProperty(data: ProjectNodeData, property: string, n: number): ProjectNodeData {
  const properties = data.properties.map((m, i) => (i === n ? property : m))
  return { ...data, properties }
}

export function deleteProperty(data: ProjectNodeData, n: number): ProjectNodeData {
  const properties = data.properties.filter((_, i) => i !== n)
  return { ...data, properties }
}

export function insertMethod(data: ProjectNodeData, method: string, n: number): ProjectNodeData {
  const methods = [...data.methods.slice(0, n + 1), method, ...data.methods.slice(n + 1)]
  return { ...data, methods }
}

export function updateMethod(data: ProjectNodeData, method: string, n: number): ProjectNodeData {
  const methods = data.methods.map((m, i) => (i === n ? method : m))
  return { ...data, methods }
}

export function deleteMethod(data: ProjectNodeData, n: number): ProjectNodeData {
  const methods = data.methods.filter((_, i) => i !== n)
  return { ...data, methods }
}
