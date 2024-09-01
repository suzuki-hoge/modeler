'use client'
import '@xyflow/react/dist/style.css'

import { ReactFlow, Background, Panel, ReactFlowProvider } from '@xyflow/react'
import React, { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import useWebSocket from 'react-use-websocket'
import { shallow } from 'zustand/shallow'

import { ConfigPanel } from '@/app/_flow/component/config-panel/ConfigPanel'
import { ClassSelectorOnPane } from '@/app/_flow/component/input/class-selector/ClassSelectorOnPane'
import {
  connectionLineStyle,
  connectionLineType,
  defaultEdgeOptions,
  edgeTypes,
} from '@/app/_flow/component/object/class-edge/ClassEdge'
import { nodeTypes } from '@/app/_flow/component/object/class-node/ClassNode'
import { ConnectionLine } from '@/app/_flow/component/object/connection-line/ConnectionLine'
import Arrows from '@/app/_flow/component/object/marker/Arrows'
import { useOnConnect, useOnEdgesChange } from '@/app/_flow/hook/edge'
import { useOnNodeDrag, useOnNodesChange } from '@/app/_flow/hook/node'
import { useOnPaneClick, useSelectorState } from '@/app/_flow/hook/pane'
import { getPageEdges, getProjectEdges } from '@/app/_flow/object/edge/request'
import { getNodeIcons, getPageNodes, getProjectNodes } from '@/app/_flow/object/node/request'
import { getPageName } from '@/app/_flow/object/page/request'
import { getUserConfig } from '@/app/_flow/object/user/request'
import { handleErrorInformation } from '@/app/_flow/socket/information/error-information'
import { handlePageMessage, pageSocketSelector, usePageSocket } from '@/app/_flow/socket/page-socket'
import { handleProjectMessage, projectSocketSelector, useProjectSocket } from '@/app/_flow/socket/project-socket'
import { userSocketSelector, useUserSocket } from '@/app/_flow/socket/user-socket'
import { pageStoreSelector, usePageStore } from '@/app/_flow/store/page-store'
import { projectStoreSelector, useProjectStore } from '@/app/_flow/store/project-store'
import { userStoreSelector, useUserStore } from '@/app/_flow/store/user-store'

interface InnerProps {
  userId: string
  projectId: string
  pageId: string
}

const Inner = (props: InnerProps) => {
  // state
  const [pageName, setPageName] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // store
  const userStore = useUserStore(userStoreSelector, shallow)
  const projectStore = useProjectStore(projectStoreSelector, shallow)
  const pageStore = usePageStore(pageStoreSelector, shallow)
  const pageNodes2 = usePageStore((state) => state.nodes, shallow)
  const pageEdges2 = usePageStore((state) => state.edges, shallow)

  // socket
  const projectSocket = useProjectSocket(projectSocketSelector, shallow)
  const pageSocket = usePageSocket(pageSocketSelector, shallow)

  // pane
  const selectorState = useSelectorState()
  const onPaneClick = useOnPaneClick(selectorState)

  // node
  const onNodesChange = useOnNodesChange(pageStore, pageSocket)
  const { onNodeDragStart, onNodeDragStop } = useOnNodeDrag(pageSocket)

  // edge
  const onEdgesChange = useOnEdgesChange(pageStore, pageSocket)
  const { onConnectStart, onConnectEnd, dragSource } = useOnConnect(
    projectStore,
    projectSocket,
    pageStore,
    pageSocket,
    selectorState,
  )

  // init
  useEffect(
    () => {
      void Promise.all([
        getUserConfig(props.userId),
        getPageName(props.pageId),
        getNodeIcons(props.projectId),
        getProjectNodes(props.projectId),
        getProjectEdges(props.projectId),
        getPageNodes(props.pageId),
        getPageEdges(props.pageId),
      ]).then(([config, pageName, nodeIcons, projectNodes, projectEdges, pageNodes, pageEdges]) => {
        userStore.putUser(
          props.userId,
          'ぺん',
          'https://i.pinimg.com/236x/a4/da/f1/a4daf1f9d6e4acf13ff81d708edfe415.jpg',
        )
        userStore.setConfig(config)
        setPageName(pageName)
        projectStore.putNodeIcons(nodeIcons)
        projectStore.putNodes(projectNodes)
        projectStore.putEdges(projectEdges)
        pageStore.putNodes(pageNodes)
        pageStore.putEdges(pageEdges)
        setLoading(false)
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <>
      <div id='page' style={{ width: '100vw', height: '100vh' }}>
        <ReactFlow
          nodes={pageNodes2}
          edges={pageEdges2}
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
          <Panel position='top-left'>{pageName}</Panel>
          <Panel position='bottom-left'>
            <ConfigPanel />
          </Panel>
          <Background />
        </ReactFlow>
        <Arrows />
        {selectorState.active && (
          <ClassSelectorOnPane
            x={`${selectorState.position.screen.x}px`}
            y={`${selectorState.position.screen.y}px`}
            dragSource={dragSource}
            newNodePosition={selectorState.position.flow}
            onClose={() => selectorState.setActive(false)}
          />
        )}
      </div>
    </>
  )
}

interface Props {
  params: {
    projectId: string
    pageId: string
  }
}

export default function Page(props: Props) {
  const userId = '189b0fba-6ad3-44d8-ac65-0d8cde285a44'

  const { lastJsonMessage, sendJsonMessage, readyState } = useWebSocket<unknown>(
    `ws://127.0.0.1:8080/ws/${props.params.projectId}/${props.params.pageId}/${userId}`,
  )

  const projectStore = useProjectStore(projectStoreSelector, shallow)
  const pageStore = usePageStore(pageStoreSelector, shallow)

  const userSocket = useUserSocket(userSocketSelector, shallow)
  const projectSocket = useProjectSocket(projectSocketSelector, shallow)
  const pageSocket = usePageSocket(pageSocketSelector, shallow)

  useEffect(
    () => {
      handleProjectMessage(lastJsonMessage, projectStore, pageStore)
      handlePageMessage(lastJsonMessage, pageStore)
      handleErrorInformation(lastJsonMessage)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lastJsonMessage],
  )

  userSocket.initSender(sendJsonMessage)
  userSocket.initState(readyState)
  projectSocket.initSender(sendJsonMessage)
  projectSocket.initState(readyState)
  pageSocket.initSender(sendJsonMessage)
  pageSocket.initState(readyState)

  return (
    <>
      <ReactFlowProvider>
        <Inner userId={userId} {...props.params} />
      </ReactFlowProvider>
      <Toaster position='top-right' reverseOrder={false} />
    </>
  )
}
