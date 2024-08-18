'use client'
import '@xyflow/react/dist/style.css'

import { ReactFlow, Background, Panel, ReactFlowProvider } from '@xyflow/react'
import React, { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import useWebSocket from 'react-use-websocket'
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
import { ConfigPanel } from '@/app/_component/config-panel/ConfigPanel'
import { ClassSelectorToUpdatePage } from '@/app/_component/input/class-selector/ClassSelectorToUpdatePage'
import { useOnConnect, useOnEdgesChange } from '@/app/_hook/edge'
import { useOnNodeDrag, useOnNodesChange } from '@/app/_hook/node'
import { useOnPaneClick, useSelectorState } from '@/app/_hook/pane'
import { fetchPageEdges, fetchProjectEdges } from '@/app/_object/edge/fetch'
import { fetchNodeIcons, fetchPageNodes, fetchProjectNodes } from '@/app/_object/node/fetch'
import { fetchPage } from '@/app/_object/page/fetch'
import { Page as PageType } from '@/app/_object/page/type'
import { fetchUserConfig } from '@/app/_object/user/config/fetch'
import { handleErrorInformation } from '@/app/_socket/information/error-information'
import { handlePageMessage, pageSocketSelector, usePageSocket } from '@/app/_socket/page-socket'
import { handleProjectMessage, projectSocketSelector, useProjectSocket } from '@/app/_socket/project-socket'
import { userSocketSelector, useUserSocket } from '@/app/_socket/user-socket'
import { pageStoreSelector, usePageStore } from '@/app/_store/page-store'
import { projectStoreSelector, useProjectStore } from '@/app/_store/project-store'
import { userStoreSelector, useUserStore } from '@/app/_store/user-store'
import { DebugPanel } from '@/app/page/[projectId]/[pageId]/DebugPanel'

interface InnerProps {
  userId: string
  projectId: string
  pageId: string
}

const Inner = (props: InnerProps) => {
  // state
  const [page, setPage] = useState<PageType>()
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
        fetchUserConfig(props.userId),
        fetchPage(props.pageId),
        fetchNodeIcons(props.projectId),
        fetchProjectNodes(props.projectId),
        fetchProjectEdges(props.projectId),
        fetchPageNodes(props.pageId),
        fetchPageEdges(props.pageId),
      ]).then(([config, page, nodeIcons, projectNodes, projectEdges, pageNodes, pageEdges]) => {
        userStore.putUser(
          props.userId,
          'ぺん',
          'https://i.pinimg.com/236x/a4/da/f1/a4daf1f9d6e4acf13ff81d708edfe415.jpg',
        )
        userStore.setConfig(config)
        setPage(page)
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

  const debug = false

  return (
    <>
      <div id='page' style={{ width: '100vw', height: debug ? '70vh' : '100vh' }}>
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
          <Panel position='top-left'>{page?.name || 'Loading...'}</Panel>
          <Panel position='bottom-left'>
            <ConfigPanel />
          </Panel>
          <Background />
        </ReactFlow>
        <Arrows />
        {selectorState.active && (
          <ClassSelectorToUpdatePage
            x={`${selectorState.position.screen.x}px`}
            y={`${selectorState.position.screen.y}px`}
            dragSource={dragSource.current}
            newNodePosition={selectorState.position.flow}
            onClose={() => selectorState.setActive(false)}
          />
        )}
      </div>
      {debug && <DebugPanel />}
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
