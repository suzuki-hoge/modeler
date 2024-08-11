import { applyEdgeChanges, applyNodeChanges, Edge, EdgeChange, Node, NodeChange } from 'reactflow'
import { createWithEqualityFn } from 'zustand/traditional'

import { PageEdgeData } from '@/app/_object/edge/type'
import { PageNodeData } from '@/app/_object/node/type'

type PageStoreWithState = {
  // node
  nodes: Node<PageNodeData>[]
  isNodeExists: (id: string) => boolean
  getNode: (id: string) => Node<PageNodeData>
  addNode: (node: Node<PageNodeData>) => void
  removeNode: (id: string) => void
  moveNode: (id: string, x: number, y: number) => void
  applyNodeChange: (change: NodeChange) => void
  modifyNode: (id: string) => void

  // edge
  edges: Edge<PageEdgeData>[]
  isEdgeExists: (id: string) => boolean
  addEdge: (edge: Edge<PageEdgeData>) => void
  removeEdge: (id: string) => void
  applyEdgeChange: (change: EdgeChange) => void

  // init
  putNodes: (nodes: Node<PageNodeData>[]) => void
  putEdges: (edges: Edge<PageEdgeData>[]) => void
}

export type PageStore = Omit<PageStoreWithState, 'nodes' | 'edges'>

export const pageStoreSelector = (store: PageStoreWithState) => ({
  // node
  isNodeExists: store.isNodeExists,
  getNode: store.getNode,
  addNode: store.addNode,
  removeNode: store.removeNode,
  moveNode: store.moveNode,
  applyNodeChange: store.applyNodeChange,
  modifyNode: store.modifyNode,

  // edge
  isEdgeExists: store.isEdgeExists,
  addEdge: store.addEdge,
  removeEdge: store.removeEdge,
  applyEdgeChange: store.applyEdgeChange,

  // init
  putNodes: store.putNodes,
  putEdges: store.putEdges,
})

export const usePageStore = createWithEqualityFn<PageStoreWithState>((set, get) => ({
  // node
  nodes: [],
  isNodeExists: (id) => get().nodes.some((node) => node.id === id),
  getNode: (id) => get().nodes.find((node) => node.id === id)!,
  addNode: (node) => set({ nodes: [...get().nodes, node] }),
  removeNode: (id) => set({ nodes: get().nodes.filter((node) => node.id !== id) }),
  moveNode: (id, x, y) =>
    set({
      nodes: get().nodes.map((node) => (node.id === id ? { ...node, ...{ position: { x, y } } } : node)),
    }),
  applyNodeChange: (change) => set({ nodes: applyNodeChanges([change], get().nodes) }),
  modifyNode: (id) =>
    set({
      nodes: get().nodes.map((node) =>
        node.id === id ? { ...node, ...{ data: { modified: new Date().toISOString() } } } : node,
      ),
    }),

  // edge
  edges: [],
  isEdgeExists: (id) => get().edges.some((edge) => edge.id === id),
  addEdge: (edge) => set({ edges: [...get().edges, edge] }),
  removeEdge: (id) => set({ edges: get().edges.filter((edge) => edge.id !== id) }),
  applyEdgeChange: (change) => set({ edges: applyEdgeChanges([change], get().edges) }),

  // init
  putNodes: (nodes) => set({ nodes }),
  putEdges: (edges) => set({ edges }),
}))
