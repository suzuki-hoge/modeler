import { ReadyState } from 'react-use-websocket/src/lib/constants'
import { SendJsonMessage } from 'react-use-websocket/src/lib/types'
import { Edge, Node } from 'reactflow'
import { createWithEqualityFn } from 'zustand/traditional'

import { PageEdgeData } from '@/app/_object/edge/type'
import { PageNodeData } from '@/app/_object/node/type'
import { handleAddEdge, sendAddEdge } from '@/app/_socket/page/edge/add-edge'
import { handleRemoveEdge, sendRemoveEdge } from '@/app/_socket/page/edge/remove-edge'
import { handleAddNode, sendAddNode } from '@/app/_socket/page/node/add-node'
import { handleMoveNode, sendMoveNode } from '@/app/_socket/page/node/move-node'
import { handleRemoveNode, sendRemoveNode } from '@/app/_socket/page/node/remove-node'
import { handleLock, sendLock } from '@/app/_socket/page/state/lock'
import { handleUnlock, sendUnlock } from '@/app/_socket/page/state/unlock'
import { PageStore } from '@/app/_store/page-store'

type PageSocketWithState = {
  // node
  addNode: (node: Node<PageNodeData>) => void
  removeNode: (objectId: string) => void
  moveNode: (objectId: string, x: number, y: number) => void

  // edge
  addEdge: (edge: Edge<PageEdgeData>) => void
  removeEdge: (objectId: string) => void

  // state
  lock: (objectId: string) => void
  unlock: (objectId: string) => void

  // init
  sender: SendJsonMessage | null
  readyState: ReadyState
  initSender: (sender: SendJsonMessage) => void
  initState: (readyState: ReadyState) => void
}

export type PageSocket2 = Omit<PageSocketWithState, 'sender' | 'readyState'>

export const pageSocketSelector = (socket: PageSocketWithState) => ({
  // node
  addNode: socket.addNode,
  removeNode: socket.removeNode,
  moveNode: socket.moveNode,

  // edge
  addEdge: socket.addEdge,
  removeEdge: socket.removeEdge,

  // state
  lock: socket.lock,
  unlock: socket.unlock,

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

  // state
  lock: (objectId) => {
    get().sender && sendLock(get().sender!, get().readyState, objectId)
  },
  unlock: (objectId) => {
    get().sender && sendUnlock(get().sender!, get().readyState, objectId)
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

    // state
    handleLock(response, store)
    handleUnlock(response, store)
  }
}
