'use client'
import 'reactflow/dist/style.css'

import { faker } from '@faker-js/faker'
import React, { useContext, useEffect, useRef } from 'react'
import useWebSocket from 'react-use-websocket'
import ReactFlow, {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  ConnectionLineType,
  Controls,
  DefaultEdgeOptions,
  EdgeTypes,
  MiniMap,
  NodeTypes,
  OnConnectEnd,
  OnConnectStart,
  OnEdgesChange,
  OnNodesChange,
  Panel,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow'
import { shallow } from 'zustand/shallow'

import { ClassEdge } from '@/app/component/class-edge/ClassEdge'
import { ClassNode } from '@/app/component/class-node/ClassNode'
import Arrows from '@/app/component/marker/Arrows'
import { allocateEdgeId, createEdge } from '@/app/object/edge'
import { allocateNodeId, createNode } from '@/app/object/node'
import {
  completeDragEnd,
  continueDrag,
  endDrag,
  getLockIds,
  getMovedPositions,
  getUnlockIds,
  isDragContinue,
  isDragEnd,
  isDragStart,
  startDrag,
} from '@/app/object/state'
import { selector, useStore } from '@/app/object/store'
import { createSocket, handle, SocketContext } from '@/app/socket/socket'

const nodeTypes: NodeTypes = { class: ClassNode }
const edgeTypes: EdgeTypes = { class: ClassEdge }
const connectionLineStyle = { stroke: 'gray', strokeWidth: 1 }
const defaultEdgeOptions: DefaultEdgeOptions = {
  style: connectionLineStyle,
  type: 'class',
  markerEnd: 'v-arrow',
}

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

  // node change

  const onNodesChange: OnNodesChange = (changes) => {
    for (const change of changes) {
      const lastDragHistory = store.dragHistory

      if (change.type === 'position' && isDragStart(change, lastDragHistory)) {
        // start
        const dragHistory = startDrag(change, lastDragHistory)

        // lock
        const lockIds = getLockIds(dragHistory)
        socket.lock(lockIds)
        store.updateLockIds(lockIds)

        // update history
        store.updateDragHistory(dragHistory)
      } else if (change.type === 'position' && isDragEnd(change, lastDragHistory)) {
        // end
        const dragHistory = endDrag(change, lastDragHistory)

        // unlock
        const unlockIds = getUnlockIds(dragHistory)
        getMovedPositions(dragHistory).forEach(({ id, x, y }) => socket.moveNode(id, x, y))
        socket.unlock(unlockIds)
        store.updateLockIds(unlockIds)

        // update history
        store.updateDragHistory(completeDragEnd(unlockIds, dragHistory))
      } else if (change.type === 'position' && isDragContinue(change)) {
        // continue
        const dragHistory = continueDrag(change, lastDragHistory)

        // update history
        store.updateDragHistory(dragHistory)
      }

      if (change.type === 'remove') {
        socket.deleteNode(change.id)
      }
    }

    store.updateNodes((nodes) => applyNodeChanges(changes, nodes))
  }

  // edge change

  const onEdgesChange: OnEdgesChange = (changes) => {
    for (const change of changes) {
      if (change.type === 'remove') {
        socket.deleteEdge(change.id)
      }
    }

    store.updateEdges((edges) => applyEdgeChanges(changes, edges))
  }

  const connectionStartNodeId = useRef<string | null>(null)

  const onConnectStart: OnConnectStart = (e, p) => {
    connectionStartNodeId.current = p.nodeId
  }

  const onConnectEnd: OnConnectEnd = (e) => {
    const event = e as MouseEvent
    const targetNodeIds = document
      .elementsFromPoint(event.clientX, event.clientY)
      .filter((e) => e.classList.contains('class-node'))
      .map((e) => e.id)

    if (targetNodeIds.length === 0) {
      console.log('new')
    } else if (connectionStartNodeId.current !== targetNodeIds[0]) {
      const edge = createEdge(allocateEdgeId(), connectionStartNodeId.current!, targetNodeIds[0])

      socket.addEdge(edge)
      store.updateEdges((edges) => [...edges, edge])
    } else {
      console.log('nothing')
    }
  }

  // pane

  const reactFlowInstance = useReactFlow()
  const onPaneClick: (event: React.MouseEvent<Element, MouseEvent>) => void = (event) => {
    const id = allocateNodeId()
    const pos = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY })
    const node = createNode(id, pos.x, pos.y)

    socket.addNode(node)
    store.updateNodes((nodes) => [...nodes, node])
  }

  return (
    <div id='page' style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={store.nodes}
        edges={store.edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineStyle={connectionLineStyle}
        connectionLineType={ConnectionLineType.Straight}
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
