import { createContext } from 'react'
import { SendJsonMessage, WebSocketLike } from 'react-use-websocket/src/lib/types'

import { handleConnect } from '@/app/_socket/connection/connect'
import { handleDisconnect } from '@/app/_socket/connection/disconnect'
import { createCreateEdge, CreateEdge, handleCreateEdge } from '@/app/_socket/project/edge/create-edge'
import { createDeleteEdge, DeleteEdge, handleDeleteEdge } from '@/app/_socket/project/edge/delete-edge'
import {
  createUpdateArrowType,
  handleUpdateArrowType,
  UpdateArrowType,
} from '@/app/_socket/project/edge/update-arrow-type'
import {
  createUpdateConnection,
  handleUpdateConnection,
  UpdateConnection,
} from '@/app/_socket/project/edge/update-connection'
import { createUpdateLabel, handleUpdateLabel, UpdateLabel } from '@/app/_socket/project/edge/update-label'
import { createCreateNode, CreateNode, handleCreateNode } from '@/app/_socket/project/node/create-node'
import { createDeleteNode, DeleteNode, handleDeleteNode } from '@/app/_socket/project/node/delete-node'
import { createUpdateIconId, handleUpdateIconId, UpdateIconId } from '@/app/_socket/project/node/update-icon-id'
import { createUpdateMethods, handleUpdateMethods, UpdateMethods } from '@/app/_socket/project/node/update-methods'
import { createUpdateName, handleUpdateName, UpdateName } from '@/app/_socket/project/node/update-name'
import {
  createUpdateProperties,
  handleUpdateProperties,
  UpdateProperties,
} from '@/app/_socket/project/node/update-properties'
import { ProjectStore } from '@/app/_store/project-store'

export type ProjectSocket = {
  response: unknown

  // node
  createNode: CreateNode
  deleteNode: DeleteNode
  updateName: UpdateName
  updateIconId: UpdateIconId
  updateProperties: UpdateProperties
  updateMethods: UpdateMethods

  // edge
  createEdge: CreateEdge
  updateConnection: UpdateConnection
  updateArrowType: UpdateArrowType
  updateLabel: UpdateLabel
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
    updateName: createUpdateName(send, socket),
    updateIconId: createUpdateIconId(send, socket),
    updateProperties: createUpdateProperties(send, socket),
    updateMethods: createUpdateMethods(send, socket),

    // edge
    createEdge: createCreateEdge(send, socket),
    updateConnection: createUpdateConnection(send, socket),
    updateArrowType: createUpdateArrowType(send, socket),
    updateLabel: createUpdateLabel(send, socket),
    deleteEdge: createDeleteEdge(send, socket),
  }
}

export const ProjectSocketContext = createContext<ProjectSocket | null>(null)

export function handleProjectMessage(response: unknown, store: ProjectStore) {
  if (response) {
    console.log(`... ${JSON.stringify(response)}`)
    // connection
    handleConnect(response, () => {})
    handleDisconnect(response, () => {})

    // node
    handleCreateNode(response, store)
    handleDeleteNode(response, store)
    handleUpdateName(response, store)
    handleUpdateIconId(response, store)
    handleUpdateProperties(response, store)
    handleUpdateMethods(response, store)

    // edge
    handleCreateEdge(response, store)
    handleUpdateConnection(response, store)
    handleUpdateArrowType(response, store)
    handleUpdateLabel(response, store)
    handleDeleteEdge(response, store)
  }
}
