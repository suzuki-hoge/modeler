'use client'
import 'reactflow/dist/style.css'
import React from 'react'
import { shallow } from 'zustand/shallow'

import { pageSelector, usePageStore } from '@/app/_store/page-store'
import { projectSelector, useProjectStore } from '@/app/_store/project-store'

function id(s: string): string {
  return s.split('-')[0]
}

export const DebugPanel = () => {
  const projectStore = useProjectStore(projectSelector, shallow)
  const pageStore = usePageStore(pageSelector, shallow)

  return (
    <div style={{ display: 'flex', flexDirection: 'row', columnGap: '1rem' }}>
      <div id='page' style={{ width: '50vw', height: '30vh', backgroundColor: 'lightgray', padding: '0.5rem' }}>
        {projectStore.nodes.map((projectNode) => (
          <p key={projectNode.id} style={{ margin: 0 }}>
            {`${id(projectNode.id)}: ${projectNode.data.name}`}
          </p>
        ))}
        <hr />
        {pageStore.nodes.map((pageNode) => (
          <p key={pageNode.id} style={{ margin: 0 }}>
            {`${id(pageNode.id)}: ${projectStore.getNode(pageNode.id).data.name} ( ${pageNode.position.x}, ${pageNode.position.y} )`}
          </p>
        ))}
      </div>
      <div id='page' style={{ width: '50vw', height: '30vh', backgroundColor: 'lightgray' }}>
        {projectStore.edges.map((projectEdge) => (
          <p key={projectEdge.id} style={{ margin: 0 }}>
            {`${id(projectEdge.id)}: ${id(projectEdge.source)} → ${id(projectEdge.target)}`}
          </p>
        ))}
        <hr />
        {pageStore.edges.map((pageEdge) => (
          <p key={pageEdge.id} style={{ margin: 0 }}>
            {`${id(pageEdge.id)}: ${id(pageEdge.source)} → ${id(pageEdge.target)}`}
          </p>
        ))}
      </div>
    </div>
  )
}
