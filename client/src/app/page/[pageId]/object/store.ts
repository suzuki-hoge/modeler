import { applyNodeChanges, Node, NodeChange, OnNodesChange } from 'reactflow'
import { createWithEqualityFn } from 'zustand/traditional'

import { initialNodes, NodeData } from '@/app/page/[pageId]/object/node'

export type Dragging = { current: string | null; prev: string | null }
export type Lock = (id: string) => void
export type Unlock = (id: string) => void
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
  onNodesChange: OnNodesChange
  dragging: Dragging
  lockIds: string[]
  lock: Lock
  unlock: Unlock
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
  onNodesChange: state.onNodesChange,
  dragging: state.dragging,
  lockIds: state.lockIds,
  lock: state.lock,
  unlock: state.unlock,
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
  onNodesChange: (changes: NodeChange[]) => {
    const { current, prev } = get().dragging
    if (changes[0].type === 'position' && changes[0].dragging && !current) {
      set({ dragging: { current: changes[0].id, prev: null } })
      get().lock(changes[0].id)
    } else if (changes[0].type === 'position' && !changes[0].dragging && current && prev) {
      set({ dragging: { current: null, prev: current } })
      get().unlock(changes[0].id)
    } else if (changes[0].type === 'position' && changes[0].dragging) {
      set({ dragging: { current: changes[0].id, prev: current } })
    }

    if (changes[0].type === 'remove') {
      console.log('node remove')
    }

    set({
      nodes: applyNodeChanges(changes, get().nodes),
    })
  },
  dragging: { current: null, prev: null },
  lockIds: [],
  lock: (id: string) => {
    set({ lockIds: get().lockIds.concat(id) })
  },
  unlock: (id: string) => {
    set({ lockIds: get().lockIds.filter((lockId) => lockId !== id) })
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
