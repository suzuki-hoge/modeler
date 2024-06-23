import { Edge, Node } from 'reactflow'
import { createWithEqualityFn } from 'zustand/traditional'

import { fetchInitialEdges } from '@/app/_object/edge/fetch'
import { ProjectEdgeData } from '@/app/_object/edge/type'
import { getInitialNodes } from '@/app/_object/node/fetch'
import { NodeHeader, NodeIcon, ProjectNodeData } from '@/app/_object/node/type'

// node
type GetNode = (id: string) => Node<ProjectNodeData>
type CreateNode = (node: Node<ProjectNodeData>) => void
type DeleteNode = (is: string) => void
type UpdateNodeData = (id: string, updater: (data: ProjectNodeData) => ProjectNodeData) => void

// edge
type GetEdge = (id: string) => Edge<ProjectEdgeData>
type FindEdge = (srcNodeId: string, dstNodeId: string) => Edge<ProjectEdgeData> | undefined
type CreateEdge = (edge: Edge<ProjectEdgeData>) => void
type UpdateEdge = (id: string, updater: (edge: Edge<ProjectEdgeData>) => Edge<ProjectEdgeData>) => void
type DeleteEdge = (is: string) => void

export type ProjectStore = {
  // node
  nodes: Node<ProjectNodeData>[]
  nodeHeaders: NodeHeader[]
  nodeIcons: NodeIcon[]
  getNode: GetNode
  createNode: CreateNode
  deleteNode: DeleteNode
  updateNodeData: UpdateNodeData

  // edge
  edges: Edge<ProjectEdgeData>[]
  getEdge: GetEdge
  findEdge: FindEdge
  createEdge: CreateEdge
  deleteEdge: DeleteEdge
  updateEdge: UpdateEdge
}

export const projectSelector = (store: ProjectStore) => ({
  // node
  nodes: store.nodes,
  nodeHeaders: store.nodeHeaders,
  nodeIcons: store.nodeIcons,
  getNode: store.getNode,
  createNode: store.createNode,
  deleteNode: store.deleteNode,
  updateNodeData: store.updateNodeData,

  // edge
  edges: store.edges,
  getEdge: store.getEdge,
  findEdge: store.findEdge,
  createEdge: store.createEdge,
  deleteEdge: store.deleteEdge,
  updateEdge: store.updateEdge,
})

export const useProjectStore = createWithEqualityFn<ProjectStore>((set, get) => ({
  // node
  nodes: getInitialNodes(),
  nodeHeaders: [
    { id: 'controller', iconId: 'controller', name: 'ItemController' },
    { id: 'usecase', iconId: 'usecase', name: 'ItemUseCase' },
    { id: 'store', iconId: 'store', name: 'ItemStore' },
    { id: 'item', iconId: 'data', name: 'Item' },
  ],
  nodeIcons: [
    { id: 'default', preview: 'C', desc: 'Class', color: 'lightgray' },
    { id: 'controller', preview: 'C', desc: 'Controller', color: 'lightgray' },
    { id: 'usecase', preview: 'UC', desc: 'UseCase', color: 'lightcyan' },
    { id: 'store', preview: 'S', desc: 'Store', color: 'lightgreen' },
    { id: 'data', preview: 'D', desc: 'Data', color: 'lightpink' },
  ],
  getNode: (id) => {
    return get().nodes.find((node) => node.id === id)!
  },
  createNode: (node) => {
    set({ nodes: [...get().nodes, node] })
  },
  deleteNode: (id) => {
    set({ nodes: get().nodes.filter((node) => node.id !== id) })
  },
  updateNodeData: (id, updater) => {
    set({
      nodes: get().nodes.map((node) => (node.id === id ? { ...node, ...{ data: updater(node.data) } } : node)),
    })
  },

  // edge
  edges: fetchInitialEdges(),
  getEdge: (id) => {
    return get().edges.find((edge) => edge.id === id)!
  },
  findEdge: (srcNodeId, dstNodeId) => {
    return get().edges.find((edge) => edge.source === srcNodeId && edge.target === dstNodeId)
  },
  createEdge: (edge) => {
    set({ edges: [...get().edges, edge] })
  },
  deleteEdge: (id) => {
    set({ edges: get().edges.filter((edge) => edge.id !== id) })
  },
  updateEdge: (id, updater) => {
    set({ edges: get().edges.map((edge) => (edge.id === id ? updater(edge) : edge)) })
  },
}))
