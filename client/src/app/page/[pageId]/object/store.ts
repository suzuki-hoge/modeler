import { Set } from 'immutable'
import { applyNodeChanges, Node, NodeChange, OnNodesChange } from 'reactflow'
import { createWithEqualityFn } from 'zustand/traditional'

import { initialNodes, NodeData } from '@/app/page/[pageId]/object/node'

export type Dragging = { current: Set<string>; prev: Set<string> }
export type LockIds = Set<string>
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
  lockIds: LockIds
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
    for (const change of changes) {
      const { current, prev } = get().dragging

      if (change.type === 'position' && change.dragging && !current.has(change.id)) {
        // drag start: lock
        set({ dragging: { current: current.add(change.id), prev: prev } })

        // current only is locked
        // get().lock(change.id)
      } else if (change.type === 'position' && !change.dragging && current.has(change.id) && prev.has(change.id)) {
        // drag end: unlock
        set({ dragging: { current: current.delete(change.id), prev: prev } })

        // prev only is unlocked
        // get().unlock(change.id)
      } else if (change.type === 'position' && change.dragging) {
        // dragging: shift prev
        set({ dragging: { current: current.add(change.id), prev: current } })
      }

      if (change.type === 'remove') {
        console.log('node remove')
      }
    }

    set({
      nodes: applyNodeChanges(changes, get().nodes),
    })
  },
  dragging: { current: Set(), prev: Set() },
  lockIds: Set(),
  lock: (id: string) => {
    const ids = get().lockIds
    set({ lockIds: ids.add(id) })
  },
  unlock: (id: string) => {
    const ids = get().lockIds
    const { current, prev } = get().dragging
    set({ lockIds: ids.delete(id), dragging: { current: current, prev: prev.delete(id) } })
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
