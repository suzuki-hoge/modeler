import { Edge, Node } from '@xyflow/react'
import { ReadyState } from 'react-use-websocket/src/lib/constants'
import { SendJsonMessage } from 'react-use-websocket/src/lib/types'
import { createWithEqualityFn } from 'zustand/traditional'

import { ProjectEdgeData } from '@/app/_flow/object/edge/type'
import { ProjectNodeData } from '@/app/_flow/object/node/type'
import { handleConnect } from '@/app/_flow/socket/connection/connect'
import { handleDisconnect } from '@/app/_flow/socket/connection/disconnect'
import { handleCreateEdge, sendCreateEdge } from '@/app/_flow/socket/project/edge/create-edge'
import { handleDeleteEdge, sendDeleteEdge } from '@/app/_flow/socket/project/edge/delete-edge'
import { handleUpdateArrowType, sendUpdateArrowType } from '@/app/_flow/socket/project/edge/update-arrow-type'
import { handleUpdateConnection, sendUpdateConnection } from '@/app/_flow/socket/project/edge/update-connection'
import { handleUpdateLabel, sendUpdateLabel } from '@/app/_flow/socket/project/edge/update-label'
import { handleCreateNode, sendCreateNode } from '@/app/_flow/socket/project/node/create-node'
import { handleDeleteNode, sendDeleteNode } from '@/app/_flow/socket/project/node/delete-node'
import { handleUpdateIconId, sendUpdateIconId } from '@/app/_flow/socket/project/node/update-icon-id'
import { handleUpdateMethods, sendUpdateMethods } from '@/app/_flow/socket/project/node/update-methods'
import { handleUpdateName, sendUpdateName } from '@/app/_flow/socket/project/node/update-name'
import { handleUpdateProperties, sendUpdateProperties } from '@/app/_flow/socket/project/node/update-properties'
import { PageStore } from '@/app/_flow/store/page-store'
import { ProjectStore } from '@/app/_flow/store/project-store'

type ProjectSocketWithState = {
  // node
  createNode: (node: Node<ProjectNodeData>) => void
  deleteNode: (objectId: string) => void
  updateName: (objectId: string, name: string) => void
  updateIconId: (objectId: string, iconId: string) => void
  updateProperties: (objectId: string, properties: string[]) => void
  updateMethods: (objectId: string, methods: string[]) => void

  // edge
  createEdge: (edge: Edge<ProjectEdgeData>) => void
  updateConnection: (edge: Edge<ProjectEdgeData>) => void
  updateArrowType: (edge: Edge<ProjectEdgeData>) => void
  updateLabel: (edge: Edge<ProjectEdgeData>) => void
  deleteEdge: (objectId: string) => void

  // init
  sender: SendJsonMessage | null
  readyState: ReadyState
  initSender: (sender: SendJsonMessage) => void
  initState: (readyState: ReadyState) => void
}

export type ProjectSocket = Omit<ProjectSocketWithState, 'sender' | 'readyState'>

export const projectSocketSelector = (socket: ProjectSocketWithState) => ({
  // node
  createNode: socket.createNode,
  deleteNode: socket.deleteNode,
  updateName: socket.updateName,
  updateIconId: socket.updateIconId,
  updateProperties: socket.updateProperties,
  updateMethods: socket.updateMethods,

  // edge
  createEdge: socket.createEdge,
  updateConnection: socket.updateConnection,
  updateArrowType: socket.updateArrowType,
  updateLabel: socket.updateLabel,
  deleteEdge: socket.deleteEdge,

  // init
  initSender: socket.initSender,
  initState: socket.initState,
})

export const useProjectSocket = createWithEqualityFn<ProjectSocketWithState>((set, get) => ({
  // node
  createNode: (node) => {
    get().sender && sendCreateNode(get().sender!, get().readyState, node)
  },
  deleteNode: (objectId) => {
    get().sender && sendDeleteNode(get().sender!, get().readyState, objectId)
  },
  updateName: (objectId, name) => {
    get().sender && sendUpdateName(get().sender!, get().readyState, objectId, name)
  },
  updateIconId: (objectId, iconId) => {
    get().sender && sendUpdateIconId(get().sender!, get().readyState, objectId, iconId)
  },
  updateProperties: (objectId, properties) => {
    get().sender && sendUpdateProperties(get().sender!, get().readyState, objectId, properties)
  },
  updateMethods: (objectId, methods) => {
    get().sender && sendUpdateMethods(get().sender!, get().readyState, objectId, methods)
  },

  // edge
  createEdge: (edge) => {
    get().sender && sendCreateEdge(get().sender!, get().readyState, edge)
  },
  updateConnection: (edge) => {
    get().sender && sendUpdateConnection(get().sender!, get().readyState, edge)
  },
  updateArrowType: (edge) => {
    get().sender && sendUpdateArrowType(get().sender!, get().readyState, edge)
  },
  updateLabel: (edge) => {
    get().sender && sendUpdateLabel(get().sender!, get().readyState, edge)
  },
  deleteEdge: (objectId) => {
    get().sender && sendDeleteEdge(get().sender!, get().readyState, objectId)
  },

  // init
  sender: null,
  readyState: -1,
  initSender: (sender) => set({ sender }),
  initState: (readyState) => set({ readyState }),
}))

export function handleProjectMessage(response: unknown, projectStore: ProjectStore, pageStore: PageStore) {
  if (response) {
    // connection
    handleConnect(response)
    handleDisconnect(response)

    // node
    handleCreateNode(response, projectStore)
    handleDeleteNode(response, projectStore)
    handleUpdateName(response, projectStore, pageStore)
    handleUpdateIconId(response, projectStore, pageStore)
    handleUpdateProperties(response, projectStore, pageStore)
    handleUpdateMethods(response, projectStore, pageStore)

    // edge
    handleCreateEdge(response, projectStore)
    handleUpdateConnection(response, projectStore)
    handleUpdateArrowType(response, projectStore)
    handleUpdateLabel(response, projectStore)
    handleDeleteEdge(response, projectStore)
  }
}
