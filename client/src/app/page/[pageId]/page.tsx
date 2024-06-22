'use client'
import 'reactflow/dist/style.css'

import { faker } from '@faker-js/faker'
import React, { useContext, useEffect } from 'react'
import useWebSocket from 'react-use-websocket'
import ReactFlow, { Background, Panel, ReactFlowProvider } from 'reactflow'
import { shallow } from 'zustand/shallow'

import {
  connectionLineStyle,
  connectionLineType,
  defaultEdgeOptions,
  edgeTypes,
} from '@/app/_component/chart/class-edge/ClassEdge'
import { nodeTypes } from '@/app/_component/chart/class-node/ClassNode'
import { ConnectionLine } from '@/app/_component/chart/connection-line/ConnectionLine'
import Arrows from '@/app/_component/chart/marker/Arrows'
import { ClassCreatableSelector } from '@/app/_component/input/class-creatable-selector/ClassCreatableSelector'
import { useOnConnect, useOnEdgesChange } from '@/app/_hook/edge'
import { useOnNodeDrag, useOnNodesChange, useOnPostNodeCreate, useOnPostNodeSelect } from '@/app/_hook/node'
import { useOnPaneClick, useSelectorState } from '@/app/_hook/pane'
import { handle, createSocket, SocketContext } from '@/app/_socket/socket'
import { selector, useStore } from '@/app/_store/store'

const Inner = () => {
  // store
  const store = useStore(selector, shallow)

  // socket
  const socket = useContext(SocketContext)!
  useEffect(
    () => handle(socket.response, store),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [socket.response],
  )

  // pane
  const selectorState = useSelectorState()
  const onPaneClick = useOnPaneClick(selectorState)

  // node
  const onNodesChange = useOnNodesChange(store, socket)
  const { onNodeDragStart, onNodeDragStop } = useOnNodeDrag(socket)

  // edge
  const onEdgesChange = useOnEdgesChange(store, socket)
  const { onConnectStart, onConnectEnd, source, setSource } = useOnConnect(store, socket, selectorState)

  // selector
  const onPostNodeCreate = useOnPostNodeCreate(store, socket, source, setSource)
  const onPostNodeSelect = useOnPostNodeSelect(store, socket, source, setSource)

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
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        onEdgesChange={onEdgesChange}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        attributionPosition='top-left'
        fitView={true}
        panOnDrag={false}
        panOnScroll={true}
        zoomOnPinch={true}
        zoomOnScroll={false}
        selectionOnDrag={true}
        onPaneClick={onPaneClick}
      >
        <Panel position='top-left'>クラス図名クラス図名クラス図名</Panel>
        <Background />
      </ReactFlow>
      <Arrows />
      {selectorState.active && (
        <ClassCreatableSelector
          x={`${selectorState.x}px`}
          y={`${selectorState.y}px`}
          headers={store.nodeHeaders}
          icons={store.nodeIcons}
          newNodePos={{ x: 0, y: 0 }}
          onSelect={onPostNodeSelect}
          onPostNodeCreate={onPostNodeCreate}
          onClose={() => selectorState.setActive(false)}
        />
      )}
    </div>
  )
}

interface Props {
  params: { pageId: string }
}

const user = faker.person.firstName()

export default function Page(props: Props) {
  const { sendJsonMessage, lastJsonMessage, getWebSocket } = useWebSocket<unknown>(
    `ws://127.0.0.1:8080/ws/${props.params.pageId}/${user}`,
  )

  return (
    <ReactFlowProvider>
      <SocketContext.Provider value={createSocket(sendJsonMessage, lastJsonMessage, getWebSocket)}>
        <Inner />
      </SocketContext.Provider>
    </ReactFlowProvider>
  )
}
