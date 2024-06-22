import { createContext } from 'react'
import { SendJsonMessage, WebSocketLike } from 'react-use-websocket/src/lib/types'

import { createEdge, updateEdge } from '@/app/_object/edge/function'
import { createNode } from '@/app/_object/node/function'
import {
  deleteMethod,
  deleteProperty,
  insertMethod,
  insertProperty,
  updateMethod,
  updateProperty,
} from '@/app/_object/node/function'
import { lock, unlock } from '@/app/_object/state/function'
import { handleConnect } from '@/app/_socket/connection/connect'
import { handleDisconnect } from '@/app/_socket/connection/disconnect'
import { handleAddEdge } from '@/app/_socket/edge/add-edge'
import { createAddEdge, AddEdge } from '@/app/_socket/edge/add-edge'
import { handleDeleteEdge } from '@/app/_socket/edge/delete-edge'
import { createDeleteEdge, DeleteEdge } from '@/app/_socket/edge/delete-edge'
import { createUpdateEdge, handleUpdateEdge, UpdateEdge } from '@/app/_socket/edge/update-edge'
import { createCreateNode, CreateNode } from '@/app/_socket/node/create-node'
import { handleCreateNode } from '@/app/_socket/node/create-node'
import { handleDeleteNode } from '@/app/_socket/node/delete-node'
import { createDeleteNode, DeleteNode } from '@/app/_socket/node/delete-node'
import { createUpdateIconId, handleUpdateIconId, UpdateIconId } from '@/app/_socket/node/header/update-icon-id'
import { handleUpdateName } from '@/app/_socket/node/header/update-name'
import { createUpdateName, UpdateName } from '@/app/_socket/node/header/update-name'
import { handleDeleteMethod } from '@/app/_socket/node/method/delete-method'
import { createDeleteMethod, DeleteMethod } from '@/app/_socket/node/method/delete-method'
import { handleInsertMethod } from '@/app/_socket/node/method/insert-method'
import { createInsertMethod, InsertMethod } from '@/app/_socket/node/method/insert-method'
import { handleUpdateMethod } from '@/app/_socket/node/method/update-method'
import { createUpdateMethod, UpdateMethod } from '@/app/_socket/node/method/update-method'
import { handleMoveNode } from '@/app/_socket/node/move-node'
import { createMoveNode, MoveNode } from '@/app/_socket/node/move-node'
import { handleDeleteProperty } from '@/app/_socket/node/property/delete-property'
import { createDeleteProperty, DeleteProperty } from '@/app/_socket/node/property/delete-property'
import { handleInsertProperty } from '@/app/_socket/node/property/insert-property'
import { createInsertProperty, InsertProperty } from '@/app/_socket/node/property/insert-property'
import { handleUpdateProperty } from '@/app/_socket/node/property/update-property'
import { createUpdateProperty, UpdateProperty } from '@/app/_socket/node/property/update-property'
import { handleLock } from '@/app/_socket/state/lock'
import { createLock, Lock } from '@/app/_socket/state/lock'
import { handleUnlock } from '@/app/_socket/state/unlock'
import { createUnlock, Unlock } from '@/app/_socket/state/unlock'
import { Store } from '@/app/_store/store'

export type Socket = {
  response: unknown

  // lock
  lock: Lock
  unlock: Unlock

  // node
  createNode: CreateNode
  moveNode: MoveNode
  deleteNode: DeleteNode

  updateIconId: UpdateIconId
  updateName: UpdateName

  insertMethod: InsertMethod
  updateMethod: UpdateMethod
  deleteMethod: DeleteMethod

  insertProperty: InsertProperty
  updateProperty: UpdateProperty
  deleteProperty: DeleteProperty

  // edge
  addEdge: AddEdge
  updateEdge: UpdateEdge
  deleteEdge: DeleteEdge
}

export function createSocket(send: SendJsonMessage, response: unknown, socket: () => WebSocketLike | null): Socket {
  return {
    response,

    // lock
    lock: createLock(send, socket),
    unlock: createUnlock(send, socket),

    // node
    createNode: createCreateNode(send, socket),
    moveNode: createMoveNode(send, socket),
    deleteNode: createDeleteNode(send, socket),

    updateIconId: createUpdateIconId(send, socket),
    updateName: createUpdateName(send, socket),

    insertMethod: createInsertMethod(send, socket),
    updateMethod: createUpdateMethod(send, socket),
    deleteMethod: createDeleteMethod(send, socket),

    insertProperty: createInsertProperty(send, socket),
    updateProperty: createUpdateProperty(send, socket),
    deleteProperty: createDeleteProperty(send, socket),

    // edge
    addEdge: createAddEdge(send, socket),
    updateEdge: createUpdateEdge(send, socket),
    deleteEdge: createDeleteEdge(send, socket),
  }
}

export const SocketContext = createContext<Socket | null>(null)

export function handle(response: unknown, store: Store) {
  if (response) {
    // connection
    handleConnect(response, () => {})
    handleDisconnect(response, () => {})

    // lock
    handleLock(response, (response) => store.updateLockIds((lockedIds) => lock(response.objectId, lockedIds)))
    handleUnlock(response, (response) => {
      store.updateLockIds((lockedIds) => unlock(response.objectId, lockedIds))
    })

    // node
    handleCreateNode(response, (response) =>
      store.updateNodes((nodes) => [...nodes, createNode(response.objectId, response.x, response.y, response.name)]),
    )
    handleMoveNode(response, (response) =>
      store.updateNode(response.objectId, (node) => ({ ...node, position: { x: response.x, y: response.y } })),
    )
    handleDeleteNode(response, (response) =>
      store.updateNodes((nodes) => nodes.filter((node) => node.id !== response.objectId)),
    )

    handleUpdateIconId(response, (response) =>
      store.updateNodeData(response.objectId, (data) => ({ ...data, iconId: response.iconId })),
    )
    handleUpdateName(response, (response) =>
      store.updateNodeData(response.objectId, (data) => ({ ...data, name: response.name })),
    )

    handleInsertMethod(response, (response) =>
      store.updateNodeData(response.objectId, (data) => insertMethod(data, response.method, response.n)),
    )
    handleUpdateMethod(response, (response) =>
      store.updateNodeData(response.objectId, (data) => updateMethod(data, response.method, response.n)),
    )
    handleDeleteMethod(response, (response) =>
      store.updateNodeData(response.objectId, (data) => deleteMethod(data, response.n)),
    )

    handleInsertProperty(response, (response) =>
      store.updateNodeData(response.objectId, (data) => insertProperty(data, response.property, response.n)),
    )
    handleUpdateProperty(response, (response) =>
      store.updateNodeData(response.objectId, (data) => updateProperty(data, response.property, response.n)),
    )
    handleDeleteProperty(response, (response) =>
      store.updateNodeData(response.objectId, (data) => deleteProperty(data, response.n)),
    )

    // edge
    handleAddEdge(response, (response) =>
      store.updateEdges((edges) => [
        ...edges,
        createEdge(response.objectId, response.src, response.dst, response.arrowType, response.label),
      ]),
    )
    handleUpdateEdge(response, (response) => store.updateEdge(response.objectId, (edge) => updateEdge(edge, response)))
    handleDeleteEdge(response, (response) =>
      store.updateEdges((edges) => edges.filter((edge) => edge.id !== response.objectId)),
    )
  }
}
