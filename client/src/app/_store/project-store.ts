import { Edge, Node } from '@xyflow/react'
import { createWithEqualityFn } from 'zustand/traditional'

import { ProjectEdgeData } from '@/app/_object/edge/type'
import { extractNodeHeader } from '@/app/_object/node/function'
import { NodeHeader, NodeIcon, ProjectNodeData } from '@/app/_object/node/type'

type ProjectStoreWithState = {
  // node
  nodes: Node<ProjectNodeData>[]
  nodeHeaders: NodeHeader[]
  nodeIcons: NodeIcon[]
  getNode: (id: string) => Node<ProjectNodeData>
  createNode: (node: Node<ProjectNodeData>) => void
  deleteNode: (is: string) => void
  updateNodeData: (id: string, updater: (data: ProjectNodeData) => ProjectNodeData) => void

  // edge
  edges: Edge<ProjectEdgeData>[]
  getEdge: (id: string) => Edge<ProjectEdgeData>
  findEdge: (srcNodeId: string, dstNodeId: string) => Edge<ProjectEdgeData> | undefined
  createEdge: (edge: Edge<ProjectEdgeData>) => void
  updateEdge: (id: string, updater: (edge: Edge<ProjectEdgeData>) => Edge<ProjectEdgeData>) => void
  deleteEdge: (is: string) => void

  // init
  putNodes: (nodes: Node<ProjectNodeData>[]) => void
  putNodeIcons: (nodeIcons: NodeIcon[]) => void
  putEdges: (edges: Edge<ProjectEdgeData>[]) => void
}

export type ProjectStore = Omit<ProjectStoreWithState, 'nodes' | 'edges' | 'nodeHeaders' | 'nodeIcons'>

export const projectStoreSelector = (store: ProjectStoreWithState) => ({
  // node
  getNode: store.getNode,
  createNode: store.createNode,
  deleteNode: store.deleteNode,
  updateNodeData: store.updateNodeData,

  // edge
  getEdge: store.getEdge,
  findEdge: store.findEdge,
  createEdge: store.createEdge,
  deleteEdge: store.deleteEdge,
  updateEdge: store.updateEdge,

  // init
  putNodes: store.putNodes,
  putNodeIcons: store.putNodeIcons,
  putEdges: store.putEdges,
})

export const useProjectStore = createWithEqualityFn<ProjectStoreWithState>((set, get) => ({
  // node
  nodes: [],
  nodeHeaders: [],
  nodeIcons: [],
  getNode: (id) => get().nodes.find((node) => node.id === id)!,
  createNode: (node) =>
    set({
      nodes: [...get().nodes, node],
      nodeHeaders: [...get().nodeHeaders, extractNodeHeader(node)],
    }),
  deleteNode: (id) =>
    set({
      nodes: get().nodes.filter((node) => node.id !== id),
      nodeHeaders: get().nodeHeaders.filter((header) => header.id !== id),
    }),
  updateNodeData: (id, updater) =>
    set({
      nodes: get().nodes.map((node) => (node.id === id ? { ...node, ...{ data: updater(node.data) } } : node)),
    }),

  // edge
  edges: [],
  getEdge: (id) => get().edges.find((edge) => edge.id === id)!,
  findEdge: (srcNodeId, dstNodeId) =>
    get().edges.find((edge) => edge.source === srcNodeId && edge.target === dstNodeId),
  createEdge: (edge) => set({ edges: [...get().edges, edge] }),
  deleteEdge: (id) => set({ edges: get().edges.filter((edge) => edge.id !== id) }),
  updateEdge: (id, updater) => set({ edges: get().edges.map((edge) => (edge.id === id ? updater(edge) : edge)) }),

  // init
  putNodes: (nodes) =>
    set({
      nodes,
      nodeHeaders: nodes.map(extractNodeHeader),
    }),
  putNodeIcons: (nodeIcons) => set({ nodeIcons }),
  putEdges: (edges) => set({ edges }),
}))
