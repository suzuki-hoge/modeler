'use client'
import 'reactflow/dist/style.css'

import { faker } from '@faker-js/faker'
import React, { useCallback, useContext, useEffect, useRef } from 'react'
import useWebSocket from 'react-use-websocket'
import ReactFlow, {
  Background,
  ConnectionLineType,
  Controls,
  DefaultEdgeOptions,
  EdgeTypes,
  MarkerType,
  MiniMap,
  Node,
  NodeTypes,
  OnConnectEnd,
  OnConnectStart,
  Panel,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow'
import { shallow } from 'zustand/shallow'

import { ClassEdge } from '@/app/object/class-edge/ClassEdge'
import { ClassNode } from '@/app/object/class-node/ClassNode'
import { selector, useStore } from '@/app/object/store'
import { Response, WebSocketContext } from '@/app/socket/context'
import { handleAddEdgeResponse } from '@/app/socket/message/add-edge'
import { handleAddMethodResponse } from '@/app/socket/message/add-method'
import { handleAddNodeResponse, sendAddNodeRequest } from '@/app/socket/message/add-node'
import { handleAddPropertyResponse } from '@/app/socket/message/add-property'
import { handleConnectResponse } from '@/app/socket/message/connect'
import { handleDeleteMethodResponse } from '@/app/socket/message/delete-method'
import { handleDeletePropertyResponse } from '@/app/socket/message/delete-property'
import { handleDisconnectResponse } from '@/app/socket/message/disconnect'
import { handleLockResponse, sendLockRequest } from '@/app/socket/message/lock'
import { handleMoveNodeResponse, sendMoveNodeRequest } from '@/app/socket/message/move-node'
import { handleUnlockResponse, sendUnlockRequest } from '@/app/socket/message/unlock'
import { handleUpdateIconResponse } from '@/app/socket/message/update-icon'
import { handleUpdateMethodResponse } from '@/app/socket/message/update-method'
import { handleUpdateNameResponse } from '@/app/socket/message/update-name'
import { handleUpdatePropertyResponse } from '@/app/socket/message/update-property'

const nodeTypes: NodeTypes = { class: ClassNode }
const edgeTypes: EdgeTypes = { class: ClassEdge }
const connectionLineStyle = { stroke: 'gray', strokeWidth: 1 }
const defaultEdgeOptions: DefaultEdgeOptions = {
  style: connectionLineStyle,
  type: 'class',
  markerEnd: { type: MarkerType.ArrowClosed },
}

function Flow() {
  const reactFlowInstance = useReactFlow()

  // store

  const {
    nodes,
    edges,
    onNodesChange,
    dragging,
    addEdge,
    lock,
    unlock,
    moveNode,
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
      handleMoveNodeResponse(moveNode, response)
      handleUpdateIconResponse(updateIcon, response)
      handleUpdateNameResponse(updateName, response)
      handleAddNodeResponse(reactFlowInstance, response)
      handleAddEdgeResponse(reactFlowInstance, response)
      handleAddPropertyResponse(addProperty, response)
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
    moveNode,
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

  // const [edges, setEdges] = useState(initialEdges)

  // const onEdgesChange: OnEdgesChange = useCallback(
  //   (changes) => {
  //     if (changes[0].type === 'remove') {
  //       console.log('edge remove')
  //     }
  //     setEdges((edges) => applyEdgeChanges(changes, edges))
  //   },
  //   [setEdges],
  // )
  // const onConnect: OnConnect = useCallback(
  //   (connection) => {
  //     sendAddEdgeRequest(send, socket, connection)
  //     setEdges((edges) => addEdge(connection, edges))
  //   },
  //   [send, socket, setEdges],
  // )

  // dragging

  useEffect(() => {
    for (const id of dragging.current.keys()) {
      if (!dragging.prev.has(id)) {
        // current only is locked
        lock(id)
        sendLockRequest(send, socket, id)
      }
    }
    for (const id of dragging.prev.keys()) {
      if (!dragging.current.has(id)) {
        // prev only is unlocked
        const pos = dragging.prev.get(id)!
        sendMoveNodeRequest(send, socket, id, pos.x, pos.y)

        unlock(id)
        sendUnlockRequest(send, socket, id)
      }
    }
  }, [send, socket, dragging, lock, unlock])

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

  const connectionStartNodeId = useRef<string | null>(null)

  const onConnectStart: OnConnectStart = useCallback((e, p) => {
    console.log('connect start', e, p)
    connectionStartNodeId.current = p.nodeId
  }, [])

  const onConnectEnd: OnConnectEnd = useCallback((e) => {
    console.log('connect end')
    const event = e as MouseEvent
    const targetNodeIds = document
      .elementsFromPoint(event.clientX, event.clientY)
      .filter((e) => e.classList.contains('class-node'))
      .map((e) => e.id)

    if (targetNodeIds.length === 0) {
      console.log('new')
    } else if (connectionStartNodeId.current !== targetNodeIds[0]) {
      addEdge(connectionStartNodeId.current!, targetNodeIds[0])
    } else {
      console.log('nothing')
    }
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineStyle={connectionLineStyle}
        connectionLineType={ConnectionLineType.Straight}
        onNodesChange={onNodesChange}
        // onEdgesChange={onEdgesChange}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        // onConnect={onConnect}
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
          </div>
        </Panel>
        <MiniMap zoomable pannable position={'bottom-right'} />
        <Controls position={'bottom-right'} />
        <Background />
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
