'use client'
import 'reactflow/dist/style.css'

import { faker } from '@faker-js/faker'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import useWebSocket from 'react-use-websocket'
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  Background,
  ConnectionLineType,
  Controls,
  MiniMap,
  Node,
  NodeTypes,
  OnConnect,
  OnEdgesChange,
  Panel,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow'
import { shallow } from 'zustand/shallow'

import { WebSocketContext, Response } from '@/app/page/[pageId]/context'
import DevTools from '@/app/page/[pageId]/dev-tool/Devtools'
import { handleAddEdgeResponse, sendAddEdgeRequest } from '@/app/page/[pageId]/message/add-edge'
import { handleAddMethodResponse } from '@/app/page/[pageId]/message/add-method'
import { handleAddNodeResponse, sendAddNodeRequest } from '@/app/page/[pageId]/message/add-node'
import { handleAddPropertyResponse } from '@/app/page/[pageId]/message/add-property'
import { handleConnectResponse } from '@/app/page/[pageId]/message/connect'
import { handleDeleteMethodResponse } from '@/app/page/[pageId]/message/delete-method'
import { handleDeletePropertyResponse } from '@/app/page/[pageId]/message/delete-property'
import { handleDisconnectResponse } from '@/app/page/[pageId]/message/disconnect'
import { handleLockResponse, sendLockRequest } from '@/app/page/[pageId]/message/lock'
import { handleUnlockResponse, sendUnlockRequest } from '@/app/page/[pageId]/message/unlock'
import { handleUpdateIconResponse } from '@/app/page/[pageId]/message/update-icon'
import { handleUpdateMethodResponse } from '@/app/page/[pageId]/message/update-method'
import { handleUpdateNameResponse } from '@/app/page/[pageId]/message/update-name'
import { handleUpdatePropertyResponse } from '@/app/page/[pageId]/message/update-property'
import { ClassNode } from '@/app/page/[pageId]/object/class-node/ClassNode'
import { defaultEdgeOptions, initialEdges } from '@/app/page/[pageId]/object/edge'
import { selector, useStore } from '@/app/page/[pageId]/object/store'

const nodeTypes: NodeTypes = { class: ClassNode }

function Flow() {
  const reactFlowInstance = useReactFlow()

  // store

  const {
    nodes,
    onNodesChange,
    dragging,
    lock,
    unlock,
    updateIcon,
    updateName,
    addProperty,
    updateProperty,
    deleteProperty,
    addMethod,
    updateMethod,
    deleteMethod,
  } = useStore(selector, shallow)

  // socket

  const { send, response, socket } = useContext(WebSocketContext)!

  useEffect(() => {
    if (response) {
      handleConnectResponse(response)
      handleDisconnectResponse(response)
      handleLockResponse(lock, response)
      handleUnlockResponse(unlock, response)
      handleAddNodeResponse(reactFlowInstance, response)
      handleAddEdgeResponse(reactFlowInstance, response)
      handleAddPropertyResponse(addProperty, response)
      handleUpdateIconResponse(updateIcon, response)
      handleUpdateNameResponse(updateName, response)
      handleUpdatePropertyResponse(updateProperty, response)
      handleDeletePropertyResponse(deleteProperty, response)
      handleAddMethodResponse(addMethod, response)
      handleUpdateMethodResponse(updateMethod, response)
      handleDeleteMethodResponse(deleteMethod, response)
    }
  }, [
    reactFlowInstance,
    lock,
    unlock,
    updateIcon,
    updateName,
    addProperty,
    updateProperty,
    deleteProperty,
    addMethod,
    updateMethod,
    deleteMethod,
    response,
  ])

  // object

  const [edges, setEdges] = useState(initialEdges)

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      if (changes[0].type === 'remove') {
        console.log('edge remove')
      }
      setEdges((edges) => applyEdgeChanges(changes, edges))
    },
    [setEdges],
  )
  const onConnect: OnConnect = useCallback(
    (connection) => {
      sendAddEdgeRequest(send, socket, connection)
      setEdges((edges) => addEdge(connection, edges))
    },
    [send, socket, setEdges],
  )

  // dragging

  useEffect(() => {
    if (dragging.current && !dragging.prev) {
      sendLockRequest(send, socket, dragging.current)
    }
    if (!dragging.current && dragging.prev) {
      sendUnlockRequest(send, socket, dragging.prev)
    }
  }, [send, socket, dragging])

  // tmp

  const add = useCallback(() => {
    const node: Node = {
      id: crypto.randomUUID(),
      position: { x: -125, y: 200 },
      data: { label: '4' },
    }
    reactFlowInstance.addNodes(node)
    sendAddNodeRequest(send, socket, node)
  }, [reactFlowInstance, send, socket])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineType={ConnectionLineType.SmoothStep}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        attributionPosition='top-right'
        fitView={true}
        panOnDrag={false}
        selectionOnDrag={true}
        zoomOnScroll={false}
        zoomOnPinch={true}
        panOnScroll={true}
      >
        <Panel position='top-left'>クラス図名クラス図名クラス図名</Panel>
        <Panel position='bottom-left'>
          <div style={{ display: 'flex', columnGap: '1rem' }}>
            <button onClick={add}>add</button>
            <span>{`dragging: { current: ${dragging.current || ''}, prev: ${dragging.prev || ''} }`}</span>
          </div>
        </Panel>
        <MiniMap zoomable pannable position={'bottom-right'} />
        <Controls position={'bottom-right'} />
        <Background />
        <DevTools />
      </ReactFlow>
    </div>
  )
}

const user = faker.person.firstName()

export default function Page({ params }: { params: { pageId: string } }) {
  const { sendJsonMessage, lastJsonMessage, getWebSocket } = useWebSocket<Response>(
    `ws://127.0.0.1:8080/ws/${params.pageId}/${user}`,
  )

  return (
    <ReactFlowProvider>
      <WebSocketContext.Provider value={{ send: sendJsonMessage, response: lastJsonMessage, socket: getWebSocket }}>
        <Flow />
      </WebSocketContext.Provider>
    </ReactFlowProvider>
  )
}
