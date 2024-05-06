'use client'

import React, { useCallback } from 'react'
import ReactFlow, { addEdge, MiniMap, Controls, Background, useNodesState, useEdgesState, Panel } from 'reactflow'

import { nodes as initialNodes, edges as initialEdges } from './initial-elements'
import AnnotationNode from './AnnotationNode'
import ToolbarNode from './ToolbarNode'
import ResizerNode from './ResizerNode'
import CircleNode from './CircleNode'
import TextNode from './TextNode'
import ButtonEdge from './ButtonEdge'

import 'reactflow/dist/style.css'
import './overview.css'
import DevTools from './Devtools'

const nodeTypes = {
  annotation: AnnotationNode,
  tools: ToolbarNode,
  resizer: ResizerNode,
  circle: CircleNode,
  textinput: TextNode,
}

const edgeTypes = {
  button: ButtonEdge,
}

const nodeClassName = (node) => node.type

const OverviewFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [])

  console.log(nodes)
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        attributionPosition='top-right'
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        className='overview'
        panOnDrag={false}
        selectionOnDrag={true}
        zoomOnScroll={false}
        zoomOnPinch={true}
        panOnScroll={true}
      >
        <Panel position='top-left'>top-left</Panel>
        <MiniMap zoomable pannable nodeClassName={nodeClassName} />
        <Controls />
        <Background />
        <DevTools />
      </ReactFlow>
    </div>
  )
}

export default OverviewFlow
