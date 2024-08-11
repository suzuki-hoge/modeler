'use client'
import '@xyflow/react/dist/style.css'
import React, { useEffect } from 'react'
import { shallow } from 'zustand/shallow'

import { usePageStore } from '@/app/_store/page-store'
import { useProjectStore } from '@/app/_store/project-store'

export const DebugPanel = () => {
  const projectNodes = useProjectStore((state) => state.nodes, shallow)
  const projectEdges = useProjectStore((state) => state.edges, shallow)
  const getProjectNode = useProjectStore((state) => state.getNode, shallow)
  const pageNodes = usePageStore((state) => state.nodes, shallow)
  const pageEdges = usePageStore((state) => state.edges, shallow)

  useEffect(
    () => {
      console.log('debug panel')
      console.log(projectNodes)
      console.log(pageNodes)
      console.log(projectEdges)
      console.log(pageEdges)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'row', columnGap: '1rem' }}>
      <div id='page' style={{ width: '50vw', height: '30vh', backgroundColor: 'lightgray', padding: '0.5rem' }}>
        {projectNodes.map((projectNode) => (
          <p key={projectNode.id} style={{ margin: 0 }}>
            {`${id(projectNode.id)}: ${projectNode.data.name}`}
          </p>
        ))}
        <hr />
        {pageNodes.map((pageNode) => (
          <p key={pageNode.id} style={{ margin: 0 }}>
            {`${id(pageNode.id)}: ${getProjectNode(pageNode.id).data.name} ( ${pageNode.position.x}, ${pageNode.position.y} )`}
          </p>
        ))}
      </div>
      <div id='page' style={{ width: '50vw', height: '30vh', backgroundColor: 'lightgray' }}>
        {projectEdges.map((projectEdge) => (
          <p key={projectEdge.id} style={{ margin: 0 }}>
            {`${id(projectEdge.id)}: ${getProjectNode(projectEdge.source).data.name} → ${getProjectNode(projectEdge.target).data.name}`}
          </p>
        ))}
        <hr />
        {pageEdges.map((pageEdge) => (
          <p key={pageEdge.id} style={{ margin: 0 }}>
            {`${id(pageEdge.id)}: ${getProjectNode(pageEdge.source).data.name} → ${getProjectNode(pageEdge.target).data.name}`}
          </p>
        ))}
      </div>
    </div>
  )
}

function id(s: string): string {
  return s.split('-')[0]
}
