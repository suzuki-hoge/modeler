import { applyNodeChanges, Node, NodeChange, OnNodesChange } from 'reactflow'
import { createWithEqualityFn } from 'zustand/traditional'

import { initialNodes, NodeData } from '@/app/page/[pageId]/object/node'

export type DeleteMethod = (id: string, i: number) => void

export type State = {
  nodes: Node<NodeData>[]
  onNodesChange: OnNodesChange
  dragging: boolean
  deleteMethod: DeleteMethod
}

export const selector = (state: State) => ({
  nodes: state.nodes,
  onNodesChange: state.onNodesChange,
  dragging: state.dragging,
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
