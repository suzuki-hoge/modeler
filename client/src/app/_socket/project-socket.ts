import { createContext } from 'react'
import { SendJsonMessage, WebSocketLike } from 'react-use-websocket/src/lib/types'

import { createEdge, updateEdge } from '@/app/_object/edge/function'
import {
  createProjectNode,
  deleteMethod,
  deleteProperty,
  insertMethod,
  insertProperty,
  updateMethod,
  updateProperty,
} from '@/app/_object/node/function'
import { handleConnect } from '@/app/_socket/connection/connect'
import { handleDisconnect } from '@/app/_socket/connection/disconnect'
import { createCreateEdge, CreateEdge, handleCreateEdge } from '@/app/_socket/project/edge/create-edge'
import { createDeleteEdge, DeleteEdge, handleDeleteEdge } from '@/app/_socket/project/edge/delete-edge'
import { createUpdateEdge, handleUpdateEdge, UpdateEdge } from '@/app/_socket/project/edge/update-edge'
import { createCreateNode, CreateNode, handleCreateNode } from '@/app/_socket/project/node/create-node'
import { createDeleteNode, DeleteNode, handleDeleteNode } from '@/app/_socket/project/node/delete-node'
import { createUpdateIconId, handleUpdateIconId, UpdateIconId } from '@/app/_socket/project/node/header/update-icon-id'
import { createUpdateName, handleUpdateName, UpdateName } from '@/app/_socket/project/node/header/update-name'
import { createDeleteMethod, DeleteMethod, handleDeleteMethod } from '@/app/_socket/project/node/method/delete-method'
import { createInsertMethod, handleInsertMethod, InsertMethod } from '@/app/_socket/project/node/method/insert-method'
import { createUpdateMethod, handleUpdateMethod, UpdateMethod } from '@/app/_socket/project/node/method/update-method'
import {
  createDeleteProperty,
  DeleteProperty,
  handleDeleteProperty,
} from '@/app/_socket/project/node/property/delete-property'
import {
  createInsertProperty,
  handleInsertProperty,
  InsertProperty,
} from '@/app/_socket/project/node/property/insert-property'
import {
  createUpdateProperty,
  handleUpdateProperty,
  UpdateProperty,
} from '@/app/_socket/project/node/property/update-property'
import { ProjectStore } from '@/app/_store/project-store'

export type ProjectSocket = {
  response: unknown

  // node
  createNode: CreateNode
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
  createEdge: CreateEdge
  updateEdge: UpdateEdge
  deleteEdge: DeleteEdge
}

export function createProjectSocket(
  send: SendJsonMessage,
  response: unknown,
  socket: () => WebSocketLike | null,
): ProjectSocket {
  return {
    response,

    // node
    createNode: createCreateNode(send, socket),
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
    createEdge: createCreateEdge(send, socket),
    updateEdge: createUpdateEdge(send, socket),
    deleteEdge: createDeleteEdge(send, socket),
  }
}

export const ProjectSocketContext = createContext<ProjectSocket | null>(null)

export function handleProjectMessage(response: unknown, store: ProjectStore) {
  if (response) {
    // connection
    handleConnect(response, () => {})
    handleDisconnect(response, () => {})

    // node
    handleCreateNode(response, (response) => store.createNode(createProjectNode(response.objectId, response.name)))
    handleDeleteNode(response, (response) => store.deleteNode(response.objectId))

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
    handleCreateEdge(response, (response) =>
      store.createEdge(createEdge(response.objectId, response.src, response.dst, response.arrowType, response.label)),
    )
    handleUpdateEdge(response, (response) => store.updateEdge(response.objectId, (edge) => updateEdge(edge, response)))
    handleDeleteEdge(response, (response) => store.deleteEdge(response.objectId))
  }
}
