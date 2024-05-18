import { Set, Map } from 'immutable'
import {
  applyEdgeChanges,
  applyNodeChanges,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnEdgesChange,
  OnNodesChange,
} from 'reactflow'
import { createWithEqualityFn } from 'zustand/traditional'

import { initialEdges } from '@/app/object/edge'
import { createNode, initialNodes, NodeData } from '@/app/object/node'

export type Dragging = { current: Map<string, { x: number; y: number }>; prev: Map<string, { x: number; y: number }> }
export type AddNode = (x: number, y: number, id?: string) => void
export type AddEdge = (srcId: string, dstId: string) => void
export type LockIds = Set<string>
export type Lock = (ids: string[]) => void
export type Unlock = (ids: string[]) => void
export type MoveNode = (id: string, x: number, y: number) => void
export type UpdateIcon = (id: string, icon: string) => void
export type UpdateName = (id: string, name: string) => void
export type AddProperty = (id: string, n: number) => void
export type UpdateProperty = (id: string, property: string, n: number) => void
export type DeleteProperty = (id: string, n: number) => void
export type AddMethod = (id: string, n: number) => void
export type UpdateMethod = (id: string, method: string, n: number) => void
export type DeleteMethod = (id: string, n: number) => void

export type State = {
  nodes: Node<NodeData>[]
  edges: Edge[]
  addNode: AddNode
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  addEdge: AddEdge
  dragging: Dragging
  lockIds: LockIds
  lock: Lock
  unlock: Unlock
  moveNode: MoveNode
  updateIcon: UpdateIcon
  updateName: UpdateName
  addProperty: AddProperty
  updateProperty: UpdateProperty
  deleteProperty: DeleteProperty
  addMethod: AddMethod
  updateMethod: UpdateMethod
  deleteMethod: DeleteMethod
}

export const selector = (state: State) => ({
  nodes: state.nodes,
  edges: state.edges,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  addEdge: state.addEdge,
  dragging: state.dragging,
  lockIds: state.lockIds,
  lock: state.lock,
  unlock: state.unlock,
  moveNode: state.moveNode,
  updateIcon: state.updateIcon,
  updateName: state.updateName,
  addProperty: state.addProperty,
  updateProperty: state.updateProperty,
  deleteProperty: state.deleteProperty,
  addMethod: state.addMethod,
  updateMethod: state.updateMethod,
  deleteMethod: state.deleteMethod,
})

export const useStore = createWithEqualityFn<State>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  addNode: (x: number, y: number, id?: string) => {
    set({ nodes: [...get().nodes, createNode(x, y)] })
  },
  onNodesChange: (changes: NodeChange[]) => {
    for (const c of changes) {
      const { current, prev } = get().dragging

      if (c.type === 'position' && c.dragging && !current.has(c.id)) {
        // drag start: lock
        const { x, y } = c.position!
        set({ dragging: { current: current.set(c.id, { x: x, y: y }), prev: prev } })

        // current only is locked
      } else if (c.type === 'position' && !c.dragging && current.has(c.id) && prev.has(c.id)) {
        // drag end: unlock
        set({ dragging: { current: current.delete(c.id), prev: prev } })

        // prev only is unlocked
      } else if (c.type === 'position' && c.dragging) {
        // dragging: shift prev
        const { x, y } = c.position!
        set({ dragging: { current: current.set(c.id, { x: x, y: y }), prev: current } })
      }

      if (c.type === 'remove') {
        console.log('node remove')
      }
    }

    set({
      nodes: applyNodeChanges(changes, get().nodes),
    })
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    for (const c of changes) {
      if (c.type === 'remove') {
        console.log('edge remove')
      }
    }
    set({
      edges: applyEdgeChanges(changes, get().edges),
    })
  },
  addEdge: (srcId: string, dstId: string) => {
    const edge: Edge = {
      id: crypto.randomUUID(),
      source: srcId,
      sourceHandle: 'center',
      target: dstId,
      targetHandle: 'center',
    }

    set({
      edges: [...get().edges, edge],
    })
  },
  dragging: { current: Map(), prev: Map() },
  lockIds: Set(),
  lock: (ids: string[]) => {
    set({ lockIds: get().lockIds.merge(...ids) })
  },
  unlock: (ids: string[]) => {
    const { current, prev } = get().dragging
    set({
      lockIds: get().lockIds.filter((id) => !ids.includes(id)),
      dragging: { current: current, prev: prev.deleteAll(ids) },
    })
  },
  moveNode: (id: string, x: number, y: number) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          node.position.x = x
          node.position.y = y
        }
        return node
      }),
    })
  },
  updateIcon: (id: string, icon: string) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          node.data = { ...node.data, icon }
        }
        return node
      }),
    })
  },
  updateName: (id: string, name: string) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          node.data = { ...node.data, name }
        }
        return node
      }),
    })
  },
  addProperty: (id: string, n: number) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          const properties = [...node.data.properties.slice(0, n + 1), '', ...node.data.properties.slice(n + 1)]
          node.data = { ...node.data, properties }
        }
        return node
      }),
    })
  },
  updateProperty: (id: string, property: string, n: number) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          const properties = node.data.properties.map((p, i) => (i === n ? property : p))
          node.data = { ...node.data, properties }
        }
        return node
      }),
    })
  },
  deleteProperty: (id: string, n: number) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          const properties = node.data.properties.filter((_, i) => i !== n)
          node.data = { ...node.data, properties }
        }
        return node
      }),
    })
  },
  addMethod: (id: string, n: number) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          const methods = [...node.data.methods.slice(0, n + 1), '', ...node.data.methods.slice(n + 1)]
          node.data = { ...node.data, methods }
        }
        return node
      }),
    })
  },
  updateMethod: (id: string, method: string, n: number) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          const methods = node.data.methods.map((m, i) => (i === n ? method : m))
          node.data = { ...node.data, methods }
        }
        return node
      }),
    })
  },
  deleteMethod: (id: string, n: number) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          const methods = node.data.methods.filter((_, i) => i !== n)
          node.data = { ...node.data, methods }
        }
        return node
      }),
    })
  },
}))
