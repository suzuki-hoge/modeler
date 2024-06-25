import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { Edge, Node, NodeDragHandler, OnNodesChange } from 'reactflow'

import { DragSource } from '@/app/_hook/edge'
import { allocateEdgeId, createEdge, extractPageEdge } from '@/app/_object/edge/function'
import { ProjectEdgeData } from '@/app/_object/edge/type'
import { expandToPageNode, extractPageNode } from '@/app/_object/node/function'
import { NodeHeader, PageNodeData, ProjectNodeData } from '@/app/_object/node/type'
import { PageSocket } from '@/app/_socket/page-socket'
import { ProjectSocket } from '@/app/_socket/project-socket'
import { PageStore } from '@/app/_store/page-store'
import { ProjectStore } from '@/app/_store/project-store'

export function useOnNodesChange(store: PageStore, socket: PageSocket): OnNodesChange {
  return (changes) => {
    for (const change of changes) {
      if (change.type === 'remove') {
        socket.removeNode(change.id)
        store.removeNode(change.id)
      } else if (change.type === 'position' && change.dragging && change.position) {
        // send move message on drag stop
        store.moveNode(change.id, change.position.x, change.position.y)
      } else if (change.type === 'select') {
        store.selectNode(change.id, change.selected)
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
): (projectNode: Node<ProjectNodeData>, x: number, y: number) => void {
  return useCallback(
    (projectNode, x, y) => {
      const pageNode = extractPageNode(projectNode, x, y)

      projectStore.createNode(projectNode)
      projectSocket.createNode(projectNode)

      if (source) {
        const projectEdge = projectStore.findEdge(source.id, projectNode.id)
        if (projectEdge) {
          edgeDrawn(pageStore, pageSocket, pageNode, projectEdge)
        } else {
          newEdgeDrawn(projectStore, projectSocket, pageStore, pageSocket, pageNode, source.id, projectNode.id)
        }
      } else {
        paneClicked(pageStore, pageSocket, pageNode)
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
): (header: NodeHeader, x: number, y: number) => void {
  return useCallback(
    (header, x, y) => {
      const pageNode = expandToPageNode(header, x, y)

      if (source) {
        const projectEdge = projectStore.findEdge(source.id, header.id)
        if (projectEdge) {
          edgeDrawn(pageStore, pageSocket, pageNode, projectEdge)
        } else {
          newEdgeDrawn(projectStore, projectSocket, pageStore, pageSocket, pageNode, source.id, header.id)
        }
      } else {
        paneClicked(pageStore, pageSocket, pageNode)
      }

      // reset drag start
      setSource(null)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [source],
  )
}

function edgeDrawn(
  pageStore: PageStore,
  pageSocket: PageSocket,
  pageNode: Node<PageNodeData>,
  projectEdge: Edge<ProjectEdgeData>,
) {
  const pageEdge = extractPageEdge(projectEdge)

  pageStore.addNode(pageNode)
  pageSocket.addNode(pageNode)
  pageStore.addEdge(pageEdge)
  pageSocket.addEdge(pageEdge)
}

function newEdgeDrawn(
  projectStore: ProjectStore,
  projectSocket: ProjectSocket,
  pageStore: PageStore,
  pageSocket: PageSocket,
  pageNode: Node<PageNodeData>,
  source: string,
  target: string,
) {
  const projectEdge = createEdge(allocateEdgeId(), source, target, 'simple', '1')
  const pageEdge = extractPageEdge(projectEdge)

  projectStore.createEdge(projectEdge)
  projectSocket.createEdge(projectEdge)
  pageStore.addNode(pageNode)
  pageSocket.addNode(pageNode)
  pageStore.addEdge(pageEdge)
  pageSocket.addEdge(pageEdge)
}

function paneClicked(pageStore: PageStore, pageSocket: PageSocket, pageNode: Node<PageNodeData>) {
  // put page node
  pageStore.addNode(pageNode)
  pageSocket.addNode(pageNode)
}
