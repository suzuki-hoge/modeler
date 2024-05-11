'use client'

import React, { useCallback, useState } from 'react'
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  ConnectionLineType,
  Controls,
  DefaultEdgeOptions,
  Edge,
  MiniMap,
  Node,
  NodeTypes,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  Panel,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow'

import 'reactflow/dist/style.css'
import DevTools from '@/app/(dev)/Devtools'
import ClassNode from '@/app/poc/ClassNode'

const initialNodes: Node[] = [
  { id: '1', type: 'default', position: { x: 0, y: 0 }, data: { label: '1', icon: 'D' } },
  { id: '2', type: 'default', position: { x: -75, y: 100 }, data: { label: '2' } },
  { id: '3', type: 'default', position: { x: 75, y: 150 }, data: { label: '3', icon: 'R' } },
]
const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
  { id: 'e1-3', source: '1', target: '3', type: 'smoothstep' },
]

const nodeTypes: NodeTypes = { class: ClassNode }
const defaultEdgeOptions: DefaultEdgeOptions = { type: 'smoothstep' }

function Flow() {
  const [dragging, setDragging] = useState(false)

  const [nodes, setNodes] = useState(initialNodes)
  const [edges, setEdges] = useState(initialEdges)
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      if (changes[0].type === 'position' && changes[0].dragging && !dragging) {
        console.log('dragging start')
        setDragging(true)
      }
      if (changes[0].type === 'position' && !changes[0].dragging && dragging) {
        console.log('dragging end')
        setDragging(false)
      }
      if (changes[0].type === 'add') {
        console.log('node add')
      }
      if (changes[0].type === 'remove') {
        console.log('node remove')
      }
      setNodes((nodes) => applyNodeChanges(changes, nodes))
    },
    [setNodes, dragging],
  )
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      if (changes[0].type === 'remove') {
        console.log('edge remove')
      }
      setEdges((edges) => applyEdgeChanges(changes, edges))
    },
    [setEdges],
  )
  const onConnect: OnConnect = useCallback(
    (connection) => {
      console.log('edge add')
      setEdges((edges) => addEdge(connection, edges))
    },
    [setEdges],
  )
  const reactFlowInstance = useReactFlow()
  const add = useCallback(() => {
    const node: Node = {
      id: '4',
      position: { x: -125, y: 200 },
      data: { label: '4' },
    }
    reactFlowInstance.addNodes(node)
  }, [reactFlowInstance])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineType={ConnectionLineType.SmoothStep}
        onConnect={onConnect}
        fitView
        attributionPosition='top-right'
        nodeTypes={nodeTypes}
        className='overview'
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
            <span>dragging: {dragging ? 'true' : 'false'}</span>
          </div>
        </Panel>
        <MiniMap zoomable pannable position={'bottom-right'} />
        <Controls position={'bottom-right'} />
        <Background />
        <DevTools />
      </ReactFlow>
    </div>
  )
}

export default function Page() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  )
}
