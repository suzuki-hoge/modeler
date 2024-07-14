import { createContext } from 'react'
import { SendJsonMessage, WebSocketLike } from 'react-use-websocket/src/lib/types'

import { AddEdge, createAddEdge, handleAddEdge } from '@/app/_socket/page/edge/add-edge'
import { handleRemoveEdge, RemoveEdge } from '@/app/_socket/page/edge/remove-edge'
import { AddNode, createAddNode, handleAddNode } from '@/app/_socket/page/node/add-node'
import { createMoveNode, handleMoveNode, MoveNode } from '@/app/_socket/page/node/move-node'
import { createRemoveNode, handleRemoveNode, RemoveNode } from '@/app/_socket/page/node/remove-node'
import { createLock, handleLock, Lock } from '@/app/_socket/page/state/lock'
import { createUnlock, handleUnlock, Unlock } from '@/app/_socket/page/state/unlock'
import { PageStore } from '@/app/_store/page-store'

export type PageSocket = {
  response: unknown

  // node
  addNode: AddNode
  removeNode: RemoveNode
  moveNode: MoveNode

  // edge
  addEdge: AddEdge
  removeEdge: RemoveEdge

  // state
  lock: Lock
  unlock: Unlock
}

export function createPageSocket(
  send: SendJsonMessage,
  response: unknown,
  socket: () => WebSocketLike | null,
): PageSocket {
  return {
    response,

    // node
    addNode: createAddNode(send, socket),
    removeNode: createRemoveNode(send, socket),
    moveNode: createMoveNode(send, socket),

    // edge
    addEdge: createAddEdge(send, socket),
    removeEdge: createRemoveNode(send, socket),

    // state
    lock: createLock(send, socket),
    unlock: createUnlock(send, socket),
  }
}

export const PageSocketContext = createContext<PageSocket | null>(null)

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
