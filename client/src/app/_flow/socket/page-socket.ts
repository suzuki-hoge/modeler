import { Edge, Node } from '@xyflow/react'
import { ReadyState } from 'react-use-websocket/src/lib/constants'
import { SendJsonMessage } from 'react-use-websocket/src/lib/types'
import { createWithEqualityFn } from 'zustand/traditional'

import { PageEdgeData } from '@/app/_flow/object/edge/type'
import { PageNodeData } from '@/app/_flow/object/node/type'
import { handleAddEdge, sendAddEdge } from '@/app/_flow/socket/page/edge/add-edge'
import { handleRemoveEdge, sendRemoveEdge } from '@/app/_flow/socket/page/edge/remove-edge'
import { handleAddNode, sendAddNode } from '@/app/_flow/socket/page/node/add-node'
import { handleMoveNode, sendMoveNode } from '@/app/_flow/socket/page/node/move-node'
import { handleRemoveNode, sendRemoveNode } from '@/app/_flow/socket/page/node/remove-node'
import { PageStore } from '@/app/_flow/store/page-store'

type PageSocketWithState = {
  // node
  addNode: (node: Node<PageNodeData>) => void
  removeNode: (objectId: string) => void
  moveNode: (objectId: string, x: number, y: number) => void

  // edge
  addEdge: (edge: Edge<PageEdgeData>) => void
  removeEdge: (objectId: string) => void

  // init
  sender: SendJsonMessage | null
  readyState: ReadyState
  initSender: (sender: SendJsonMessage) => void
  initState: (readyState: ReadyState) => void
}

export type PageSocket = Omit<PageSocketWithState, 'sender' | 'readyState'>

export const pageSocketSelector = (socket: PageSocketWithState) => ({
  // node
  addNode: socket.addNode,
  removeNode: socket.removeNode,
  moveNode: socket.moveNode,

  // edge
  addEdge: socket.addEdge,
  removeEdge: socket.removeEdge,

  // init
  initSender: socket.initSender,
  initState: socket.initState,
})

export const usePageSocket = createWithEqualityFn<PageSocketWithState>((set, get) => ({
  // node
  addNode: (node) => {
    get().sender && sendAddNode(get().sender!, get().readyState, node)
  },
  removeNode: (objectId) => {
    get().sender && sendRemoveNode(get().sender!, get().readyState, objectId)
  },
  moveNode: (objectId, x, y) => {
    get().sender && sendMoveNode(get().sender!, get().readyState, objectId, x, y)
  },

  // edge
  addEdge: (edge) => {
    get().sender && sendAddEdge(get().sender!, get().readyState, edge)
  },
  removeEdge: (objectId) => {
    get().sender && sendRemoveEdge(get().sender!, get().readyState, objectId)
  },

  // init
  sender: null,
  readyState: -1,
  initSender: (sender) => set({ sender }),
  initState: (readyState) => set({ readyState }),
}))

export function handlePageMessage(response: unknown, store: PageStore) {
  if (response) {
    // node
    handleAddNode(response, store)
    handleRemoveNode(response, store)
    handleMoveNode(response, store)

    // edge
    handleAddEdge(response, store)
    handleRemoveEdge(response, store)
  }
}
