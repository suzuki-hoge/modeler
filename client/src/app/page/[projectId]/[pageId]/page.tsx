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
import { createOnPostNodeCreate, createOnPostNodeSelect, useOnNodeDrag, useOnNodesChange } from '@/app/_hook/node'
import { useOnPaneClick, useSelectorState } from '@/app/_hook/pane'
import { usePageEdges, useProjectEdges } from '@/app/_object/edge/fetch'
import { useNodeIcons, usePageNodes, useProjectNodes } from '@/app/_object/node/fetch'
import { createPageSocket, handlePageMessage, PageSocketContext } from '@/app/_socket/page-socket'
import { createProjectSocket, handleProjectMessage, ProjectSocketContext } from '@/app/_socket/project-socket'
import { pageSelector, usePageStore } from '@/app/_store/page-store'
import { projectSelector, useProjectStore } from '@/app/_store/project-store'
import { DebugPanel } from '@/app/page/[projectId]/[pageId]/DebugPanel'

interface InnerProps {
  projectId: string
  pageId: string
}

const Inner = (props: InnerProps) => {
  // store
  const projectStore = useProjectStore(projectSelector, shallow)
  const pageStore = usePageStore(pageSelector, shallow)
  const pageNodes2 = usePageStore((state) => state.nodes, shallow)
  const pageEdges2 = usePageStore((state) => state.edges, shallow)

  // socket
  const projectSocket = useContext(ProjectSocketContext)!
  const pageSocket = useContext(PageSocketContext)!
  useEffect(
    () => {
      handleProjectMessage(projectSocket.response, projectStore)
      handlePageMessage(projectSocket.response, pageStore)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projectSocket.response],
  )

  // pane
  const selectorState = useSelectorState()
  const onPaneClick = useOnPaneClick(selectorState)

  // node
  const onNodesChange = useOnNodesChange(pageStore, pageSocket)
  const { onNodeDragStart, onNodeDragStop } = useOnNodeDrag(pageSocket)

  // edge
  const onEdgesChange = useOnEdgesChange(pageStore, pageSocket)
  const { onConnectStart, onConnectEnd, source, setSource } = useOnConnect(
    projectStore,
    projectSocket,
    pageStore,
    pageSocket,
    selectorState,
  )

  // selector
  const onPostNodeCreate = createOnPostNodeCreate(projectStore, projectSocket, pageStore, pageSocket, source, setSource)
  const onPostNodeSelect = createOnPostNodeSelect(projectStore, projectSocket, pageStore, pageSocket, source, setSource)

  // init
  const [icons, isValidating1] = useNodeIcons(props.projectId)
  const [projectNodes, isValidating2] = useProjectNodes(props.projectId)
  const [projectEdges, isValidating3] = useProjectEdges(props.projectId)
  const [pageNodes, isValidating4] = usePageNodes(props.pageId)
  const [pageEdges, isValidating5] = usePageEdges(props.pageId)
  useEffect(
    () => {
      if (!isValidating1) projectStore.putNodeIcons(icons!)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [icons],
  )
  useEffect(
    () => {
      if (!isValidating2) projectStore.putNodes(projectNodes!)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projectNodes],
  )
  useEffect(
    () => {
      if (!isValidating3) projectStore.putEdges(projectEdges!)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projectEdges],
  )
  useEffect(
    () => {
      if (!isValidating4) pageStore.putNodes(pageNodes!)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pageNodes],
  )
  useEffect(
    () => {
      if (!isValidating5) pageStore.putEdges(pageEdges!)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pageEdges],
  )

  if (isValidating1 || isValidating2 || isValidating3 || isValidating4 || isValidating5) {
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
          <Panel position='top-left'>クラス図名クラス図名クラス図名</Panel>
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
  const { sendJsonMessage, lastJsonMessage, getWebSocket } = useWebSocket<unknown>(
    `ws://127.0.0.1:8080/ws/${props.params.projectId}/${props.params.pageId}/${user}`,
  )

  return (
    <ReactFlowProvider>
      <ProjectSocketContext.Provider value={createProjectSocket(sendJsonMessage, lastJsonMessage, getWebSocket)}>
        <PageSocketContext.Provider value={createPageSocket(sendJsonMessage, lastJsonMessage, getWebSocket)}>
          <Inner {...props.params} />
        </PageSocketContext.Provider>
      </ProjectSocketContext.Provider>
    </ReactFlowProvider>
  )
}
