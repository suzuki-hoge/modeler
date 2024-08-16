'use client'
import '@xyflow/react/dist/style.css'

import { faker } from '@faker-js/faker'
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
import { ClassCreatableSelector } from '@/app/_component/input/class-creatable-selector/ClassCreatableSelector'
import { useOnConnect, useOnEdgesChange } from '@/app/_hook/edge'
import { createOnPostNodeCreate, createOnPostNodeSelect, useOnNodeDrag, useOnNodesChange } from '@/app/_hook/node'
import { useOnPaneClick, useSelectorState } from '@/app/_hook/pane'
import { fetchPageEdges, fetchProjectEdges } from '@/app/_object/edge/fetch'
import { fetchNodeIcons, fetchPageNodes, fetchProjectNodes } from '@/app/_object/node/fetch'
import { fetchPage } from '@/app/_object/page/fetch'
import { Page as PageType } from '@/app/_object/page/type'
import { handleErrorInformation } from '@/app/_socket/information/error-information'
import { handlePageMessage, pageSocketSelector, usePageSocket } from '@/app/_socket/page-socket'
import { handleProjectMessage, projectSocketSelector, useProjectSocket } from '@/app/_socket/project-socket'
import { pageStoreSelector, usePageStore } from '@/app/_store/page-store'
import { projectStoreSelector, useProjectStore } from '@/app/_store/project-store'
import { DebugPanel } from '@/app/page/[projectId]/[pageId]/DebugPanel'

interface InnerProps {
  projectId: string
  pageId: string
}

const Inner = (props: InnerProps) => {
  // state
  const [page, setPage] = useState<PageType>()
  const [loading, setLoading] = useState(true)

  // store
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
  const { onConnectStart, onConnectEnd, source } = useOnConnect(
    projectStore,
    projectSocket,
    pageStore,
    pageSocket,
    selectorState,
  )

  // selector
  const onPostNodeCreate = createOnPostNodeCreate(projectStore, projectSocket, pageStore, pageSocket, source)
  const onPostNodeSelect = createOnPostNodeSelect(projectStore, projectSocket, pageStore, pageSocket, source)

  // init
  useEffect(
    () => {
      void Promise.all([
        fetchPage(props.pageId),
        fetchNodeIcons(props.projectId),
        fetchProjectNodes(props.projectId),
        fetchProjectEdges(props.projectId),
        fetchPageNodes(props.pageId),
        fetchPageEdges(props.pageId),
      ]).then(([page, nodeIcons, projectNodes, projectEdges, pageNodes, pageEdges]) => {
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

  const debug = true

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
          <Background />
        </ReactFlow>
        <Arrows />
        {selectorState.active && (
          <ClassCreatableSelector
            x={`${selectorState.position.screen.x}px`}
            y={`${selectorState.position.screen.y}px`}
            headers={projectStore.nodeHeaders}
            icons={projectStore.nodeIcons}
            newNodePosition={selectorState.position.flow}
            onSelect={onPostNodeSelect}
            onPostNodeCreate={onPostNodeCreate}
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

const user = faker.person.firstName()

export default function Page(props: Props) {
  const { lastJsonMessage, sendJsonMessage, readyState } = useWebSocket<unknown>(
    `ws://127.0.0.1:8080/ws/${props.params.projectId}/${props.params.pageId}/${user}`,
  )

  const projectSocket = useProjectSocket(projectSocketSelector, shallow)
  const pageSocket = usePageSocket(pageSocketSelector, shallow)
  const projectStore = useProjectStore(projectStoreSelector, shallow)
  const pageStore = usePageStore(pageStoreSelector, shallow)

  useEffect(
    () => {
      handleProjectMessage(lastJsonMessage, projectStore, pageStore)
      handlePageMessage(lastJsonMessage, pageStore)
      handleErrorInformation(lastJsonMessage)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lastJsonMessage],
  )

  projectSocket.initSender(sendJsonMessage)
  projectSocket.initState(readyState)
  pageSocket.initSender(sendJsonMessage)
  pageSocket.initState(readyState)

  return (
    <>
      <ReactFlowProvider>
        <Inner {...props.params} />
      </ReactFlowProvider>
      <Toaster position='top-right' reverseOrder={false} />
    </>
  )
}
