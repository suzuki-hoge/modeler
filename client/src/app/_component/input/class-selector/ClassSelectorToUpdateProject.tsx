'use client'

import { Node } from '@xyflow/react'
import { shallow } from 'zustand/shallow'

import { ClassSelector } from '@/app/_component/input/class-selector/ClassSelector'
import { allocateEdgeId, createProjectEdge } from '@/app/_object/edge/function'
import { allocateNodeId, createProjectNode } from '@/app/_object/node/function'
import { NodeHeader, ProjectNodeData } from '@/app/_object/node/type'
import { projectSocketSelector, useProjectSocket } from '@/app/_socket/project-socket'
import { projectStoreSelector, useProjectStore } from '@/app/_store/project-store'

interface Props {
  x: string
  y: string
  defaultId?: string
  sourceNodeId: string
  onSelect: (choice: NodeHeader) => void
  onCreate: (projectNode: Node<ProjectNodeData>) => void
  onClose: () => void
}

export const ClassSelectorToUpdateProject = (props: Props) => {
  const projectStore = useProjectStore(projectStoreSelector, shallow)
  const projectSocket = useProjectSocket(projectSocketSelector, shallow)

  return (
    <ClassSelector
      x={props.x}
      y={props.y}
      defaultId={props.defaultId}
      onSelect={(header) => {
        props.onSelect(header)

        // project node exists

        // create project edge if missing
        if (props.sourceNodeId !== header.id && !projectStore.findEdge(props.sourceNodeId, header.id)) {
          const projectEdge = createProjectEdge(allocateEdgeId(), props.sourceNodeId, header.id, 'simple', '1')
          projectStore.createEdge(projectEdge)
          projectSocket.createEdge(projectEdge)
        }
      }}
      onCreate={(name) => {
        const projectNode = createProjectNode(allocateNodeId(), name)
        props.onCreate(projectNode)

        // create project node
        projectStore.createNode(projectNode)
        projectSocket.createNode(projectNode)

        if (props.sourceNodeId !== projectNode.id) {
          // create project edge
          const projectEdge = createProjectEdge(allocateEdgeId(), props.sourceNodeId, projectNode.id, 'simple', '1')
          projectStore.createEdge(projectEdge)
          projectSocket.createEdge(projectEdge)
        }
      }}
      onClose={props.onClose}
    />
  )
}
