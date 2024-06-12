import { Set } from 'immutable'
import { Edge, Node } from 'reactflow'
import { createWithEqualityFn } from 'zustand/traditional'

import { fetchInitialEdges } from '@/app/_object/edge/fetch'
import { EdgeData } from '@/app/_object/edge/type'
import { getInitialNodes } from '@/app/_object/node/fetch'
import { NodeData, NodeHeader, NodeIcon } from '@/app/_object/node/type'
import { LockIds } from '@/app/_object/state/type'

// lock
export type IsLocked = (id: string) => boolean
export type UpdateLockIds = (updater: (lockIds: LockIds) => LockIds) => void

// node
export type GetNode = (id: string) => Node<NodeData>
export type UpdateNodes = (updater: (nodes: Node<NodeData>[]) => Node<NodeData>[]) => void
export type UpdateNode = (id: string, updater: (node: Node<NodeData>) => Node<NodeData>) => void
export type UpdateNodeData = (id: string, updater: (data: NodeData) => NodeData) => void

// edge
export type GetEdge = (id: string) => Edge<EdgeData>
export type IsEdgeExists = (srcNodeId: string, dstNodeId: string) => boolean
export type UpdateEdges = (updater: (edges: Edge<EdgeData>[]) => Edge<EdgeData>[]) => void
export type UpdateEdge = (id: string, updater: (node: Edge<EdgeData>) => Edge<EdgeData>) => void

export type Store = {
  // state
  lockIds: LockIds
  isLocked: IsLocked
  updateLockIds: UpdateLockIds

  // node
  nodes: Node<NodeData>[]
  getNode: GetNode
  updateNodes: UpdateNodes
  updateNode: UpdateNode
  updateNodeData: UpdateNodeData

  // edge
  edges: Edge<EdgeData>[]
  getEdge: GetEdge
  isEdgeExists: IsEdgeExists
  updateEdges: UpdateEdges
  updateEdge: UpdateEdge

  // share
  nodeHeaders: NodeHeader[]
  nodeIcons: NodeIcon[]
}

export const selector = (store: Store) => ({
  // state
  lockIds: store.lockIds,
  isLocked: store.isLocked,
  updateLockIds: store.updateLockIds,

  // node
  nodes: store.nodes,
  getNode: store.getNode,
  updateNodes: store.updateNodes,
  updateNode: store.updateNode,
  updateNodeData: store.updateNodeData,

  // edge
  edges: store.edges,
  getEdge: store.getEdge,
  isEdgeExists: store.isEdgeExists,
  updateEdges: store.updateEdges,
  updateEdge: store.updateEdge,

  // share
  nodeHeaders: store.nodeHeaders,
  nodeIcons: store.nodeIcons,
})

export const useStore = createWithEqualityFn<Store>((set, get) => ({
  // state
  lockIds: Set(), // fixme: fetch
  isLocked: (id) => get().lockIds.contains(id),
  updateLockIds: (updater) => {
    set({ lockIds: updater(get().lockIds) })
  },

  // node
  nodes: getInitialNodes(),
  getNode: (id) => {
    return get().nodes.find((node) => node.id === id)!
  },
  updateNodes: (updater) => {
    set({ nodes: updater(get().nodes) })
  },
  updateNode: (id, updater) => {
    set({
      nodes: get().nodes.map((node) => (node.id === id ? updater(node) : node)),
    })
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
  isEdgeExists: (srcNodeId, dstNodeId) => {
    return get().edges.some((edge) => edge.source === srcNodeId && edge.target === dstNodeId)
  },
  updateEdges: (updater) => {
    set({ edges: updater(get().edges) })
  },
  updateEdge: (id, updater) => {
    set({
      edges: get().edges.map((edge) => (edge.id === id ? updater(edge) : edge)),
    })
  },

  // share
  nodeHeaders: [
    { id: 'controller', iconId: 'controller', name: 'ItemController' },
    { id: 'usecase', iconId: 'usecase', name: 'ItemUseCase' },
    { id: 'store', iconId: 'store', name: 'ItemStore' },
    { id: 'item', iconId: 'data', name: 'Item' },
  ],
  nodeIcons: [
    { id: 'controller', preview: 'C', desc: 'Controller', color: 'lightgray' },
    { id: 'usecase', preview: 'UC', desc: 'UseCase', color: 'lightcyan' },
    { id: 'store', preview: 'S', desc: 'Store', color: 'lightgreen' },
    { id: 'data', preview: 'D', desc: 'Data', color: 'lightpink' },
  ],
}))
