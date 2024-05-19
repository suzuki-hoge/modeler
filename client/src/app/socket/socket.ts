import { createContext } from 'react'
import { SendJsonMessage, WebSocketLike } from 'react-use-websocket/src/lib/types'

import { createEdge } from '@/app/object/edge'
import {
  createNode,
  deleteMethod,
  deleteProperty,
  insertMethod,
  insertProperty,
  updateMethod,
  updateProperty,
} from '@/app/object/node'
import { completeDragEnd, lock, unlock } from '@/app/object/state'
import { Store } from '@/app/object/store'
import { handleConnect } from '@/app/socket/connection/connect'
import { handleDisconnect } from '@/app/socket/connection/disconnect'
import { handleAddEdge } from '@/app/socket/edge/add-edge'
import { createAddEdge, AddEdge } from '@/app/socket/edge/add-edge'
import { handleDeleteEdge } from '@/app/socket/edge/delete-edge'
import { createDeleteEdge, DeleteEdge } from '@/app/socket/edge/delete-edge'
import { handleAddNode } from '@/app/socket/node/add-node'
import { createAddNode, AddNode } from '@/app/socket/node/add-node'
import { handleDeleteNode } from '@/app/socket/node/delete-node'
import { createDeleteNode, DeleteNode } from '@/app/socket/node/delete-node'
import { handleUpdateIcon } from '@/app/socket/node/header/update-icon'
import { createUpdateIcon, UpdateIcon } from '@/app/socket/node/header/update-icon'
import { handleUpdateName } from '@/app/socket/node/header/update-name'
import { createUpdateName, UpdateName } from '@/app/socket/node/header/update-name'
import { handleDeleteMethod } from '@/app/socket/node/method/delete-method'
import { createDeleteMethod, DeleteMethod } from '@/app/socket/node/method/delete-method'
import { handleInsertMethod } from '@/app/socket/node/method/insert-method'
import { createInsertMethod, InsertMethod } from '@/app/socket/node/method/insert-method'
import { handleUpdateMethod } from '@/app/socket/node/method/update-method'
import { createUpdateMethod, UpdateMethod } from '@/app/socket/node/method/update-method'
import { handleMoveNode } from '@/app/socket/node/move-node'
import { createMoveNode, MoveNode } from '@/app/socket/node/move-node'
import { handleDeleteProperty } from '@/app/socket/node/property/delete-property'
import { createDeleteProperty, DeleteProperty } from '@/app/socket/node/property/delete-property'
import { handleInsertProperty } from '@/app/socket/node/property/insert-property'
import { createInsertProperty, InsertProperty } from '@/app/socket/node/property/insert-property'
import { handleUpdateProperty } from '@/app/socket/node/property/update-property'
import { createUpdateProperty, UpdateProperty } from '@/app/socket/node/property/update-property'
import { handleLock } from '@/app/socket/state/lock'
import { createLock, Lock } from '@/app/socket/state/lock'
import { handleUnlock } from '@/app/socket/state/unlock'
import { createUnlock, Unlock } from '@/app/socket/state/unlock'

export type Socket = {
  response: unknown

  // state
  lock: Lock
  unlock: Unlock

  // node
  addNode: AddNode
  moveNode: MoveNode
  deleteNode: DeleteNode

  updateIcon: UpdateIcon
  updateName: UpdateName

  insertMethod: InsertMethod
  updateMethod: UpdateMethod
  deleteMethod: DeleteMethod

  insertProperty: InsertProperty
  updateProperty: UpdateProperty
  deleteProperty: DeleteProperty

  // edge
  addEdge: AddEdge
  deleteEdge: DeleteEdge
}

export function createSocket(send: SendJsonMessage, response: unknown, socket: () => WebSocketLike | null): Socket {
  return {
    response,

    // state
    lock: createLock(send, socket),
    unlock: createUnlock(send, socket),

    // node
    addNode: createAddNode(send, socket),
    moveNode: createMoveNode(send, socket),
    deleteNode: createDeleteNode(send, socket),

    updateIcon: createUpdateIcon(send, socket),
    updateName: createUpdateName(send, socket),

    insertMethod: createInsertMethod(send, socket),
    updateMethod: createUpdateMethod(send, socket),
    deleteMethod: createDeleteMethod(send, socket),

    insertProperty: createInsertProperty(send, socket),
    updateProperty: createUpdateProperty(send, socket),
    deleteProperty: createDeleteProperty(send, socket),

    // edge
    addEdge: createAddEdge(send, socket),
    deleteEdge: createDeleteEdge(send, socket),
  }
}

export const SocketContext = createContext<Socket | null>(null)

export function handle(response: unknown, store: Store) {
  if (response) {
    // connection
    handleConnect(response, () => {})
    handleDisconnect(response, () => {})

    // state
    handleLock(response, (response) => store.updateLockIds(lock(response.objectIds, store.lockIds)))
    handleUnlock(response, (response) => {
      store.updateLockIds(unlock(response.objectIds, store.lockIds))
      store.updateDragHistory(completeDragEnd(response.objectIds, store.dragHistory))
    })

    // node
    handleAddNode(response, (response) =>
      store.updateNodes((nodes) => [...nodes, createNode(response.objectId, response.x, response.y)]),
    )
    handleMoveNode(response, (response) =>
      store.updateNode(response.objectId, (node) => ({ ...node, position: { x: response.x, y: response.y } })),
    )
    handleDeleteNode(response, (response) =>
      store.updateNodes((nodes) => nodes.filter((node) => node.id !== response.objectId)),
    )

    handleUpdateIcon(response, (response) =>
      store.updateNodeData(response.objectId, (data) => ({ ...data, icon: response.icon })),
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
      store.updateEdges((edges) => [...edges, createEdge(response.objectId, response.src, response.dst)]),
    )
    handleDeleteEdge(response, (response) =>
      store.updateEdges((edges) => edges.filter((edge) => edge.id !== response.objectId)),
    )
  }
}
