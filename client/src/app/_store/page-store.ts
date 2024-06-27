import { Set } from 'immutable'
import { applyEdgeChanges, applyNodeChanges, Edge, EdgeChange, Node, NodeChange } from 'reactflow'
import { createWithEqualityFn } from 'zustand/traditional'

import { PageEdgeData } from '@/app/_object/edge/type'
import { PageNodeData } from '@/app/_object/node/type'
import { LockIds } from '@/app/_object/state/type'

// node
type GetNode = (id: string) => Node<PageNodeData>
type AddNode = (node: Node<PageNodeData>) => void
type RemoveNode = (id: string) => void
type MoveNode = (id: string, x: number, y: number) => void
type ApplyNodeChange = (change: NodeChange) => void

// edge
type IsEdgeExists = (id: string) => boolean
type AddEdge = (edge: Edge<PageEdgeData>) => void
type RemoveEdge = (id: string) => void
type ApplyEdgeChange = (change: EdgeChange) => void

// state
type IsLocked = (id: string) => boolean
type Lock = (id: string) => void
type Unlock = (id: string) => void

// init
type PutNodes = (nodes: Node<PageNodeData>[]) => void
type PutEdges = (edges: Edge<PageEdgeData>[]) => void

export type PageStore = {
  // node
  nodes: Node<PageNodeData>[]
  getNode: GetNode
  addNode: AddNode
  removeNode: RemoveNode
  moveNode: MoveNode
  applyNodeChange: ApplyNodeChange

  // edge
  edges: Edge<PageEdgeData>[]
  isEdgeExists: IsEdgeExists
  addEdge: AddEdge
  removeEdge: RemoveEdge
  applyEdgeChange: ApplyEdgeChange

  // state
  lockIds: LockIds
  isLocked: IsLocked
  lock: Lock
  unlock: Unlock

  // init
  putNodes: PutNodes
  putEdges: PutEdges
}

export const pageSelector = (store: PageStore) => ({
  // node
  nodes: store.nodes,
  getNode: store.getNode,
  addNode: store.addNode,
  removeNode: store.removeNode,
  moveNode: store.moveNode,
  applyNodeChange: store.applyNodeChange,

  // edge
  edges: store.edges,
  isEdgeExists: store.isEdgeExists,
  addEdge: store.addEdge,
  removeEdge: store.removeEdge,
  applyEdgeChange: store.applyEdgeChange,

  // state
  lockIds: store.lockIds,
  isLocked: store.isLocked,
  lock: store.lock,
  unlock: store.unlock,

  // init
  putNodes: store.putNodes,
  putEdges: store.putEdges,
})

export const usePageStore = createWithEqualityFn<PageStore>((set, get) => ({
  // node
  nodes: [],
  getNode: (id) => get().nodes.find((node) => node.id === id)!,
  addNode: (node) => set({ nodes: [...get().nodes, node] }),
  removeNode: (id) => set({ nodes: get().nodes.filter((node) => node.id !== id) }),
  moveNode: (id, x, y) =>
    set({
      nodes: get().nodes.map((node) => (node.id === id ? { ...node, ...{ position: { x, y } } } : node)),
    }),
  applyNodeChange: (change) => set({ nodes: applyNodeChanges([change], get().nodes) }),

  // edge
  edges: [],
  isEdgeExists: (id) => get().edges.some((edge) => edge.id === id),
  addEdge: (edge) => set({ edges: [...get().edges, edge] }),
  removeEdge: (id) => set({ edges: get().edges.filter((edge) => edge.id !== id) }),
  applyEdgeChange: (change) => set({ edges: applyEdgeChanges([change], get().edges) }),

  // state
  lockIds: Set(),
  isLocked: (id) => get().lockIds.contains(id),
  lock: (id) => set({ lockIds: get().lockIds.add(id) }),
  unlock: (id) => set({ lockIds: get().lockIds.delete(id) }),
  // init
  putNodes: (nodes) => set({ nodes }),
  putEdges: (edges) => set({ edges }),
}))
