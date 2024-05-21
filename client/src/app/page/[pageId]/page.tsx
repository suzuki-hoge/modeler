'use client'
import 'reactflow/dist/style.css'

import { faker } from '@faker-js/faker'
import React, { useContext, useEffect } from 'react'
import useWebSocket from 'react-use-websocket'
import ReactFlow, { Background, Controls, MiniMap, Panel, ReactFlowProvider } from 'reactflow'
import { shallow } from 'zustand/shallow'

import Arrows from '@/app/component/marker/Arrows'
import { connectionLineStyle, connectionLineType, defaultEdgeOptions, edgeTypes } from '@/app/object/edge/config'
import { useOnConnect, useOnEdgesChange } from '@/app/object/edge/operation'
import { nodeTypes } from '@/app/object/node/config'
import { useOnNodesChange } from '@/app/object/node/operation'
import { useOnPaneClick } from '@/app/object/pane/pane'
import { selector, useStore } from '@/app/object/store'
import { createSocket, handle, SocketContext } from '@/app/socket/socket'

function Flow() {
  // store
  const store = useStore(selector, shallow)

  // socket
  const socket = useContext(SocketContext)!
  useEffect(
    () => handle(socket.response, store),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [socket.response],
  )

  // node
  const onNodesChange = useOnNodesChange(store, socket)

  // edge
  const onEdgesChange = useOnEdgesChange(store, socket)
  const { onConnectStart, onConnectEnd } = useOnConnect(store, socket)

  // pane
  const onPaneClick = useOnPaneClick(store, socket)

  return (
    <div id='page' style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={store.nodes}
        edges={store.edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineStyle={connectionLineStyle}
        connectionLineType={connectionLineType}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        attributionPosition='top-right'
        fitView={true}
        panOnDrag={false}
        panOnScroll={true}
        zoomOnPinch={true}
        zoomOnScroll={false}
        selectionOnDrag={true}
        onPaneClick={onPaneClick}
      >
        <Panel position='top-left'>クラス図名クラス図名クラス図名</Panel>
        <MiniMap zoomable pannable position={'bottom-right'} />
        <Controls position={'bottom-right'} />
        <Background />
      </ReactFlow>
      <Arrows />
    </div>
  )
}

const user = faker.person.firstName()

export default function Page({ params }: { params: { pageId: string } }) {
  const { sendJsonMessage, lastJsonMessage, getWebSocket } = useWebSocket<unknown>(
    `ws://127.0.0.1:8080/ws/${params.pageId}/${user}`,
  )

  return (
    <ReactFlowProvider>
      <SocketContext.Provider value={createSocket(sendJsonMessage, lastJsonMessage, getWebSocket)}>
        <Flow />
      </SocketContext.Provider>
    </ReactFlowProvider>
  )
}
