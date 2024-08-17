'use client'
import { XYPosition } from '@xyflow/react'
import { shallow } from 'zustand/shallow'

import { ClassSelector } from '@/app/_component/input/class-selector/ClassSelector'
import { DragSource } from '@/app/_hook/edge'
import { allocateEdgeId, createProjectEdge, extractPageEdge } from '@/app/_object/edge/function'
import { allocateNodeId, createProjectNode, expandToPageNode, extractPageNode } from '@/app/_object/node/function'
import { pageSocketSelector, usePageSocket } from '@/app/_socket/page-socket'
import { projectSocketSelector, useProjectSocket } from '@/app/_socket/project-socket'
import { pageStoreSelector, usePageStore } from '@/app/_store/page-store'
import { projectStoreSelector, useProjectStore } from '@/app/_store/project-store'

interface Props {
  x: string
  y: string
  dragSource: DragSource | null
  newNodePosition: XYPosition
  onClose: () => void
}

export const ClassSelectorToUpdatePage = (props: Props) => {
  const projectStore = useProjectStore(projectStoreSelector, shallow)
  const pageStore = usePageStore(pageStoreSelector, shallow)
  const projectSocket = useProjectSocket(projectSocketSelector, shallow)
  const pageSocket = usePageSocket(pageSocketSelector, shallow)

  return (
    <ClassSelector
      x={props.x}
      y={props.y}
      onSelect={(header) => {
        // project node exists

        // add page node if missing
        if (!pageStore.isNodeExists(header.id)) {
          const pageNode = expandToPageNode(header, props.newNodePosition)
          pageStore.addNode(pageNode)
          pageSocket.addNode(pageNode)
        }

        // if dragged
        if (props.dragSource) {
          const projectEdge = projectStore.findEdge(props.dragSource.id, header.id)

          if (projectEdge && !pageStore.isEdgeExists(projectEdge.id)) {
            // add page edge if missing
            const pageEdge = extractPageEdge(projectEdge)
            pageStore.addEdge(pageEdge)
            pageSocket.addEdge(pageEdge)
          } else {
            const source = props.dragSource

            // create project edge if missing
            const projectEdge = createProjectEdge(allocateEdgeId(), source.id, header.id, source.arrowType, '1')
            projectStore.createEdge(projectEdge)
            projectSocket.createEdge(projectEdge)

            // add page edge if missing
            const pageEdge = extractPageEdge(projectEdge)
            pageStore.addEdge(pageEdge)
            pageSocket.addEdge(pageEdge)
          }
        }
      }}
      onCreate={(name) => {
        // create project node
        const projectNode = createProjectNode(allocateNodeId(), name)
        projectStore.createNode(projectNode)
        projectSocket.createNode(projectNode)

        // add page node
        const pageNode = extractPageNode(projectNode, props.newNodePosition)
        pageStore.addNode(pageNode)
        pageSocket.addNode(pageNode)

        // if dragged
        if (props.dragSource) {
          const source = props.dragSource

          // create project edge
          const projectEdge = createProjectEdge(allocateEdgeId(), source.id, projectNode.id, source.arrowType, '1')
          projectStore.createEdge(projectEdge)
          projectSocket.createEdge(projectEdge)

          // add page edge
          const pageEdge = extractPageEdge(projectEdge)
          pageStore.addEdge(pageEdge)
          pageSocket.addEdge(pageEdge)
        }
      }}
      onClose={props.onClose}
    />
  )
}
