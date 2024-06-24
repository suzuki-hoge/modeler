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
import { usePageEdges, useProjectEdges } from '@/app/_object/edge/fetch'
import { useNodeIcons, usePageNodes, useProjectNodes } from '@/app/_object/node/fetch'
import { createPageSocket, PageSocketContext } from '@/app/_socket/page-socket'
import { createProjectSocket, handleProjectMessage, ProjectSocketContext } from '@/app/_socket/project-socket'
import { pageSelector, usePageStore } from '@/app/_store/page-store'
import { projectSelector, useProjectStore } from '@/app/_store/project-store'

const Inner = () => {
  // store
  const projectStore = useProjectStore(projectSelector, shallow)
  const pageStore = usePageStore(pageSelector, shallow)

  // socket
  const projectSocket = useContext(ProjectSocketContext)!
  const pageSocket = useContext(PageSocketContext)!
  useEffect(
    () => handleProjectMessage(projectSocket.response, projectStore),
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
  const onEdgesChange = useOnEdgesChange(projectStore, projectSocket)
  const { onConnectStart, onConnectEnd, source, setSource } = useOnConnect(projectStore, projectSocket, selectorState)

  // selector
  const onPostNodeCreate = useOnPostNodeCreate(projectStore, projectSocket, pageStore, pageSocket, source, setSource)
  const onPostNodeSelect = useOnPostNodeSelect(projectStore, projectSocket, pageStore, pageSocket, source, setSource)

  // init
  const [icons, isValidating1] = useNodeIcons('1')
  const [projectNodes, isValidating2] = useProjectNodes('1')
  const [projectEdges, isValidating3] = useProjectEdges('1')
  const [pageNodes, isValidating4] = usePageNodes('1', '1')
  const [pageEdges, isValidating5] = usePageEdges('1', '1')
  useEffect(
    () => {
      if (!isValidating1) projectStore.putNodeIcons(icons!)
      if (!isValidating2) projectStore.putNodes(projectNodes!)
      if (!isValidating3) projectStore.putEdges(projectEdges!)
      if (!isValidating4) pageStore.putNodes(pageNodes!)
      if (!isValidating5) pageStore.putEdges(pageEdges!)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isValidating1, isValidating2, isValidating3, isValidating4, isValidating5],
  )

  return (
    <div id='page' style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={projectStore.nodes}
        edges={projectStore.edges}
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
          headers={projectStore.nodeHeaders}
          icons={projectStore.nodeIcons}
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
    `ws://127.0.0.1:8080/ws/1/${props.params.pageId}/${user}`,
  )

  return (
    <ReactFlowProvider>
      <ProjectSocketContext.Provider value={createProjectSocket(sendJsonMessage, lastJsonMessage, getWebSocket)}>
        <PageSocketContext.Provider value={createPageSocket(sendJsonMessage, lastJsonMessage, getWebSocket)}>
          <Inner />
        </PageSocketContext.Provider>
      </ProjectSocketContext.Provider>
    </ReactFlowProvider>
  )
}
