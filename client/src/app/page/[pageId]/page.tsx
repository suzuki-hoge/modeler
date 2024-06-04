'use client'
import 'reactflow/dist/style.css'

import { faker } from '@faker-js/faker'
import React, { useContext, useEffect, useState } from 'react'
import useWebSocket from 'react-use-websocket'
import ReactFlow, { Background, Controls, MiniMap, Panel, ReactFlowProvider } from 'reactflow'
import { shallow } from 'zustand/shallow'

import { ConnectionLine } from '@/app/_component/chart/connection-line/ConnectionLine'
import Arrows from '@/app/_component/chart/marker/Arrows'
import {
  ApplyToNewNode,
  ClassSelector,
  ClassSelectorVarsContext,
} from '@/app/_component/text/class-selector/ClassSelector'
import { createSocket, handle, SocketContext } from '@/app/_socket/socket'
import { connectionLineStyle, connectionLineType, defaultEdgeOptions, edgeTypes } from '@/app/_store/edge/config'
import { useOnConnect, useOnEdgesChange } from '@/app/_store/edge/operation'
import { nodeTypes } from '@/app/_store/node/config'
import { useOnNodesChange } from '@/app/_store/node/operation'
import { useOnPaneClick } from '@/app/_store/pane/pane'
import { selector, useStore } from '@/app/_store/store'

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

  // class selector
  const { showClassSelector } = useContext(ClassSelectorVarsContext)!

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
        connectionLineComponent={ConnectionLine}
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
      {showClassSelector && <ClassSelector projectId={'1'} />}
    </div>
  )
}

const user = faker.person.firstName()

export default function Page({ params }: { params: { pageId: string } }) {
  const { sendJsonMessage, lastJsonMessage, getWebSocket } = useWebSocket<unknown>(
    `ws://127.0.0.1:8080/ws/${params.pageId}/${user}`,
  )

  const [showClassSelector, setShowClassSelector] = useState(false)
  const [newNodePos, setNewNodePos] = useState({ x: 0, y: 0 })
  const [applyToNewNode, setApplyToNewNode] = useState<ApplyToNewNode>(() => () => {})
  const vars = { showClassSelector, setShowClassSelector, newNodePos, setNewNodePos, applyToNewNode, setApplyToNewNode }

  return (
    <ReactFlowProvider>
      <ClassSelectorVarsContext.Provider value={vars}>
        <SocketContext.Provider value={createSocket(sendJsonMessage, lastJsonMessage, getWebSocket)}>
          <Flow />
        </SocketContext.Provider>
      </ClassSelectorVarsContext.Provider>
    </ReactFlowProvider>
  )
}
