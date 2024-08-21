import { Node, XYPosition } from '@xyflow/react'

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
  return { id: node.id, type: 'class', position, data: { created: Date.now(), modified: '' } }
}

export function extractNodeHeader(node: Node<ProjectNodeData>): NodeHeader {
  return { id: node.id, iconId: node.data.iconId, name: node.data.name }
}

export function expandToPageNode(header: NodeHeader, position: XYPosition): Node<PageNodeData> {
  return { id: header.id, type: 'class', position, data: { created: Date.now(), modified: '' } }
}

export function insertString(values: string[], value: string, n: number): string[] {
  return [...values.slice(0, n + 1), value, ...values.slice(n + 1)]
}

export function updateString(values: string[], value: string, n: number): string[] {
  return values.map((m, i) => (i === n ? value : m))
}

export function deleteString(values: string[], n: number): string[] {
  return values.filter((_, i) => i !== n)
}
