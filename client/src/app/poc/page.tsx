'use client'

import React, { useCallback } from 'react'
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  MiniMap,
  Panel,
  useEdgesState,
  useNodesState,
} from 'reactflow'

import 'reactflow/dist/style.css'
import DevTools from '@/app/(dev)/Devtools'
import ClassNode from '@/app/poc/ClassNode'

const initialNodes = [
  { id: '1', type: 'class', position: { x: 0, y: 0 }, data: { label: '1', icon: 'D' } },
  { id: '2', type: 'class', position: { x: 0, y: 200 }, data: { label: '2', icon: 'R' } },
  { id: '3', type: 'default', position: { x: 0, y: 300 }, data: { label: '3' } },
]
const initialEdges = [{ id: 'e1-2', source: '1', target: '2', type: 'smoothstep' }]

const nodeTypes = { class: ClassNode }

export default function Page() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((edges) => addEdge(params, edges)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

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
        // edgeTypes={edgeTypes}
        className='overview'
        panOnDrag={false}
        selectionOnDrag={true}
        zoomOnScroll={false}
        zoomOnPinch={true}
        panOnScroll={true}
      >
        <Panel position='top-left'>ページタイトル</Panel>
        <MiniMap zoomable pannable position={'bottom-right'} />
        <Controls position={'bottom-right'} />
        <Background />
        <DevTools />
      </ReactFlow>
    </div>
  )
}
