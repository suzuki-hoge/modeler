import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { Node, NodeDragHandler, OnNodesChange } from 'reactflow'

import { DragSource } from '@/app/_hook/edge'
import { allocateEdgeId, createEdge, extractPageEdge } from '@/app/_object/edge/function'
import { extractPageNode } from '@/app/_object/node/function'
import { NodeHeader, ProjectNodeData } from '@/app/_object/node/type'
import { PageSocket } from '@/app/_socket/page-socket'
import { ProjectSocket } from '@/app/_socket/project-socket'
import { PageStore } from '@/app/_store/page-store'
import { ProjectStore } from '@/app/_store/project-store'

export function useOnNodesChange(store: PageStore, socket: PageSocket): OnNodesChange {
  return (changes) => {
    console.log(changes)
    for (const change of changes) {
      if (change.type === 'remove') {
        socket.removeNode(change.id)
        store.removeNode(change.id)
      } else if (change.type === 'position' && change.dragging && change.position) {
        socket.moveNode(change.id, change.position.x, change.position.y)
        store.moveNode(change.id, change.position.x, change.position.y)
      }
    }
  }
}

export function useOnNodeDrag(socket: PageSocket): {
  onNodeDragStart: NodeDragHandler
  onNodeDragStop: NodeDragHandler
} {
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)

  const onNodeDragStart: NodeDragHandler = (_event, node) => {
    setStartX(node.position.x)
    setStartY(node.position.y)
  }
  const onNodeDragStop: NodeDragHandler = (_event, node, nodes) => {
    if (startX !== node.position.x || startY !== node.position.y) {
      nodes.forEach((node) => socket.moveNode(node.id, node.position.x, node.position.y))
    }
  }

  return { onNodeDragStart, onNodeDragStop }
}

export function useOnPostNodeCreate(
  projectStore: ProjectStore,
  projectSocket: ProjectSocket,
  pageStore: PageStore,
  pageSocket: PageSocket,
  source: DragSource | null,
  setSource: Dispatch<SetStateAction<DragSource | null>>,
): (node: Node<ProjectNodeData>) => void {
  return useCallback(
    (node) => {
      projectStore.createNode(node)
      projectSocket.createNode(node)
      pageStore.addNode(extractPageNode(node))
      pageSocket.addNode(extractPageNode(node))

      if (source) {
        const edge = createEdge(allocateEdgeId(), source.id, node.id, 'simple', '1')
        projectStore.createEdge(edge)
        projectSocket.createEdge(edge)
        pageStore.addEdge(extractPageEdge(edge))
        pageSocket.addEdge(extractPageEdge(edge))
      }

      setSource(null)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [source],
  )
}

export function useOnPostNodeSelect(
  projectStore: ProjectStore,
  projectSocket: ProjectSocket,
  pageStore: PageStore,
  pageSocket: PageSocket,
  source: DragSource | null,
  setSource: Dispatch<SetStateAction<DragSource | null>>,
): (header: NodeHeader) => void {
  return useCallback(
    (header) => {
      if (source) {
        const projectEdge = projectStore.findEdge(source.id, header.id)
        if (projectEdge) {
          pageStore.addEdge(extractPageEdge(projectEdge))
          pageSocket.addEdge(extractPageEdge(projectEdge))
        } else {
          const edge = createEdge(allocateEdgeId(), source.id, header.id, 'simple', '1')
          projectStore.createEdge(edge)
          projectSocket.createEdge(edge)
          pageStore.addEdge(extractPageEdge(edge))
          pageSocket.addEdge(extractPageEdge(edge))
        }
      }

      setSource(null)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [source],
  )
}
