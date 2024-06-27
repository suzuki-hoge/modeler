import { Edge, Node } from 'reactflow'
import { createWithEqualityFn } from 'zustand/traditional'

import { ProjectEdgeData } from '@/app/_object/edge/type'
import { extractNodeHeader } from '@/app/_object/node/function'
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

// init
type PutNodes = (nodes: Node<ProjectNodeData>[]) => void
type PutNodeIcons = (nodeIcons: NodeIcon[]) => void
type PutEdges = (edges: Edge<ProjectEdgeData>[]) => void

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

  // init
  putNodes: PutNodes
  putNodeIcons: PutNodeIcons
  putEdges: PutEdges
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

  // init
  putNodes: store.putNodes,
  putNodeIcons: store.putNodeIcons,
  putEdges: store.putEdges,
})

export const useProjectStore = createWithEqualityFn<ProjectStore>((set, get) => ({
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
