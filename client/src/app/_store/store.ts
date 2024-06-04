import { Set } from 'immutable'
import { Edge, Node } from 'reactflow'
import { createWithEqualityFn } from 'zustand/traditional'

import { fetchInitialEdges } from '@/app/_store/edge/fetch'
import { EdgeData } from '@/app/_store/edge/type'
import { getInitialNodes } from '@/app/_store/node/fetch'
import { NodeData } from '@/app/_store/node/type'
import { DragHistory, initDragHistory } from '@/app/_store/state/drag'
import { LockIds } from '@/app/_store/state/lock'

// state
export type UpdateDragHistory = (dragHistory: DragHistory) => void
export type UpdateLockIds = (lockIds: LockIds) => void

// node
export type GetNode = (id: string) => Node<NodeData>
export type UpdateNodes = (updater: (nodes: Node<NodeData>[]) => Node<NodeData>[]) => void
export type UpdateNode = (id: string, updater: (node: Node<NodeData>) => Node<NodeData>) => void
export type UpdateNodeData = (id: string, updater: (data: NodeData) => NodeData) => void

// edge
export type GetEdge = (id: string) => Edge<EdgeData>
export type UpdateEdges = (updater: (edges: Edge<EdgeData>[]) => Edge<EdgeData>[]) => void
export type UpdateEdge = (id: string, updater: (node: Edge<EdgeData>) => Edge<EdgeData>) => void

export type Store = {
  // state
  dragHistory: DragHistory
  updateDragHistory: UpdateDragHistory
  lockIds: LockIds
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
  updateEdges: UpdateEdges
  updateEdge: UpdateEdge
}

export const selector = (store: Store) => ({
  // state
  dragHistory: store.dragHistory,
  updateDragHistory: store.updateDragHistory,
  lockIds: store.lockIds,
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
  updateEdges: store.updateEdges,
  updateEdge: store.updateEdge,
})

export const useStore = createWithEqualityFn<Store>((set, get) => ({
  // state
  dragHistory: initDragHistory(),
  updateDragHistory: (dragHistory) => {
    set({ dragHistory })
  },
  lockIds: Set(),
  updateLockIds: (lockIds) => {
    set({ lockIds })
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
  updateEdges: (updater) => {
    set({ edges: updater(get().edges) })
  },
  updateEdge: (id, updater) => {
    set({
      edges: get().edges.map((edge) => (edge.id === id ? updater(edge) : edge)),
    })
  },
}))
