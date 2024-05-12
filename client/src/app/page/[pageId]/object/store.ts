import { applyNodeChanges, Node, NodeChange, OnNodesChange } from 'reactflow'
import { createWithEqualityFn } from 'zustand/traditional'

import { initialNodes, NodeData } from '@/app/page/[pageId]/object/node'

export type AddProperty = (id: string, n: number) => void
export type UpdateProperty = (id: string, n: number, property: string) => void
export type DeleteProperty = (id: string, n: number) => void
export type AddMethod = (id: string, n: number) => void
export type UpdateMethod = (id: string, n: number, method: string) => void
export type DeleteMethod = (id: string, n: number) => void

export type State = {
  nodes: Node<NodeData>[]
  onNodesChange: OnNodesChange
  dragging: boolean
  addProperty: AddProperty
  updateProperty: UpdateProperty
  deleteProperty: DeleteProperty
  addMethod: AddMethod
  updateMethod: UpdateMethod
  deleteMethod: DeleteMethod
}

export const selector = (state: State) => ({
  nodes: state.nodes,
  onNodesChange: state.onNodesChange,
  dragging: state.dragging,
  addProperty: state.addProperty,
  updateProperty: state.updateProperty,
  deleteProperty: state.deleteProperty,
  addMethod: state.addMethod,
  updateMethod: state.updateMethod,
  deleteMethod: state.deleteMethod,
})

export const useStore = createWithEqualityFn<State>((set, get) => ({
  nodes: initialNodes,
  onNodesChange: (changes: NodeChange[]) => {
    console.log(changes[0])
    if (changes[0].type === 'position' && changes[0].dragging && !get().dragging) {
      set({ dragging: true })
    }
    if (changes[0].type === 'position' && !changes[0].dragging && get().dragging) {
      set({ dragging: false })
    }
    if (changes[0].type === 'remove') {
      console.log('node remove')
    }
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    })
  },
  dragging: false,
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
  updateProperty: (id: string, n: number, property: string) => {
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
  updateMethod: (id: string, n: number, method: string) => {
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
