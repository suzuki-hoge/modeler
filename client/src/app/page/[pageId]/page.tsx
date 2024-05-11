'use client'
import 'reactflow/dist/style.css'

import { faker } from '@faker-js/faker'
import React, { useCallback, useEffect, useState } from 'react'
import useWebSocket from 'react-use-websocket'
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  ConnectionLineType,
  Controls,
  MiniMap,
  Node,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  Panel,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow'

import DevTools from '@/app/page/[pageId]/(dev-tool)/Devtools'
import { handleAddEdgeResponse, sendAddEdgeRequest } from '@/app/page/[pageId]/(message)/add-edge'
import { handleAddNodeResponse, sendAddNodeRequest } from '@/app/page/[pageId]/(message)/add-node'
import { handleConnectResponse } from '@/app/page/[pageId]/(message)/connect'
import { handleDisconnectResponse } from '@/app/page/[pageId]/(message)/disconnect'
import { handleLockResponse } from '@/app/page/[pageId]/(message)/lock'
import { handleUnlockResponse } from '@/app/page/[pageId]/(message)/unlock'
import { defaultEdgeOptions, initialEdges } from '@/app/page/[pageId]/(object)/edge'
import { initialNodes } from '@/app/page/[pageId]/(object)/node'

const user = faker.person.firstName()

function Flow({ pageId }: { pageId: string }) {
  const reactFlowInstance = useReactFlow()

  // socket

  const { sendJsonMessage, lastJsonMessage, getWebSocket } = useWebSocket<Response>(
    `ws://127.0.0.1:8080/ws/${pageId}/${user}`,
  )

  useEffect(() => {
    if (lastJsonMessage) {
      handleConnectResponse(lastJsonMessage)
      handleDisconnectResponse(lastJsonMessage)
      handleLockResponse(lastJsonMessage)
      handleUnlockResponse(lastJsonMessage)
      handleAddNodeResponse(reactFlowInstance, lastJsonMessage)
      handleAddEdgeResponse(reactFlowInstance, lastJsonMessage)
    }
  }, [reactFlowInstance, lastJsonMessage])

  // state

  const [dragging, setDragging] = useState(false)

  // object

  const [nodes, setNodes] = useState(initialNodes)
  const [edges, setEdges] = useState(initialEdges)

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      if (changes[0].type === 'position' && changes[0].dragging && !dragging) {
        setDragging(true)
      }
      if (changes[0].type === 'position' && !changes[0].dragging && dragging) {
        setDragging(false)
      }
      if (changes[0].type === 'remove') {
        console.log('node remove')
      }
      setNodes((nodes) => applyNodeChanges(changes, nodes))
    },
    [setNodes, dragging],
  )
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
      sendAddEdgeRequest(sendJsonMessage, getWebSocket, connection)
      setEdges((edges) => addEdge(connection, edges))
    },
    [sendJsonMessage, getWebSocket, setEdges],
  )

  // tmp

  const add = useCallback(() => {
    const node: Node = {
      id: crypto.randomUUID(),
      position: { x: -125, y: 200 },
      data: { label: '4' },
    }
    reactFlowInstance.addNodes(node)
    sendAddNodeRequest(sendJsonMessage, getWebSocket, node)
  }, [reactFlowInstance, sendJsonMessage, getWebSocket])

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
        fitView
        attributionPosition='top-right'
        // nodeTypes={nodeTypes}
        className='overview'
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
            <span>dragging: {dragging ? 'true' : 'false'}</span>
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

export default function Page({ params }: { params: { pageId: string } }) {
  return (
    <ReactFlowProvider>
      <Flow pageId={params.pageId} />
    </ReactFlowProvider>
  )
}
