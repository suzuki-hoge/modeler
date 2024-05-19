import { Set } from 'immutable'
import { Edge, Node } from 'reactflow'
import { createWithEqualityFn } from 'zustand/traditional'

import { initialEdges } from '@/app/object/edge'
import { initialNodes, NodeData } from '@/app/object/node'
import { DragHistory, initDragHistory, LockIds } from '@/app/object/state'

// state
export type UpdateDragHistory = (dragHistory: DragHistory) => void
export type UpdateLockIds = (lockIds: LockIds) => void

// node
export type UpdateNodes = (updater: (nodes: Node<NodeData>[]) => Node<NodeData>[]) => void
export type UpdateNode = (id: string, updater: (node: Node<NodeData>) => Node<NodeData>) => void
export type UpdateNodeData = (id: string, updater: (data: NodeData) => NodeData) => void

// edge
export type UpdateEdges = (updater: (edges: Edge[]) => Edge[]) => void

export type Store = {
  // state
  dragHistory: DragHistory
  updateDragHistory: UpdateDragHistory
  lockIds: LockIds
  updateLockIds: UpdateLockIds

  // node
  nodes: Node<NodeData>[]
  updateNodes: UpdateNodes
  updateNode: UpdateNode
  updateNodeData: UpdateNodeData

  // edge
  edges: Edge[]
  updateEdges: UpdateEdges
}

export const selector = (store: Store) => ({
  // state
  dragHistory: store.dragHistory,
  updateDragHistory: store.updateDragHistory,
  lockIds: store.lockIds,
  updateLockIds: store.updateLockIds,

  // node
  nodes: store.nodes,
  updateNodes: store.updateNodes,
  updateNode: store.updateNode,
  updateNodeData: store.updateNodeData,

  // edge
  edges: store.edges,
  updateEdges: store.updateEdges,
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
  nodes: initialNodes,
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
  edges: initialEdges,
  updateEdges: (updater) => {
    set({ edges: updater(get().edges) })
  },
}))
