import { createContext } from 'react'
import { SendJsonMessage, WebSocketLike } from 'react-use-websocket/src/lib/types'

import { handleConnect } from '@/app/_socket/connection/connect'
import { handleDisconnect } from '@/app/_socket/connection/disconnect'
import { handleAddEdge } from '@/app/_socket/edge/add-edge'
import { createAddEdge, AddEdge } from '@/app/_socket/edge/add-edge'
import { handleDeleteEdge } from '@/app/_socket/edge/delete-edge'
import { createDeleteEdge, DeleteEdge } from '@/app/_socket/edge/delete-edge'
import { createUpdateEdge, handleUpdateEdge, UpdateEdge } from '@/app/_socket/edge/update-edge'
import { handleAddNode } from '@/app/_socket/node/add-node'
import { createAddNode, AddNode } from '@/app/_socket/node/add-node'
import { handleDeleteNode } from '@/app/_socket/node/delete-node'
import { createDeleteNode, DeleteNode } from '@/app/_socket/node/delete-node'
import { handleUpdateIcon } from '@/app/_socket/node/header/update-icon'
import { createUpdateIcon, UpdateIcon } from '@/app/_socket/node/header/update-icon'
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
import { createEdge, updateEdge } from '@/app/_store/edge/function'
import {
  createNode,
  deleteMethod,
  deleteProperty,
  insertMethod,
  insertProperty,
  updateMethod,
  updateProperty,
} from '@/app/_store/node/function'
import { completeDragEnd } from '@/app/_store/state/drag'
import { lock, unlock } from '@/app/_store/state/lock'
import { Store } from '@/app/_store/store'

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
  updateEdge: UpdateEdge
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

    // state
    handleLock(response, (response) => store.updateLockIds(lock(response.objectIds, store.lockIds)))
    handleUnlock(response, (response) => {
      store.updateLockIds(unlock(response.objectIds, store.lockIds))
      store.updateDragHistory(completeDragEnd(response.objectIds, store.dragHistory))
    })

    // node
    handleAddNode(response, (response) =>
      store.updateNodes((nodes) => [...nodes, createNode(response.objectId, response.x, response.y, response.name)]),
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
