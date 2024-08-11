import { Edge, Node, OnNodeDrag, OnNodesChange, XYPosition } from '@xyflow/react'
import { MutableRefObject, useState } from 'react'

import { DragSource } from '@/app/_hook/edge'
import { allocateEdgeId, createEdge, extractPageEdge } from '@/app/_object/edge/function'
import { ProjectEdgeData } from '@/app/_object/edge/type'
import { expandToPageNode, extractPageNode } from '@/app/_object/node/function'
import { NodeHeader, PageNodeData, ProjectNodeData } from '@/app/_object/node/type'
import { PageSocket } from '@/app/_socket/page-socket'
import { ProjectSocket } from '@/app/_socket/project-socket'
import { PageStore } from '@/app/_store/page-store'
import { ProjectStore } from '@/app/_store/project-store'

export function useOnNodesChange(store: PageStore, socket: PageSocket): OnNodesChange<Node<PageNodeData>> {
  return (changes) => {
    for (const change of changes) {
      if (change.type === 'remove') {
        socket.removeNode(change.id)
        store.removeNode(change.id)
      } else if (change.type === 'position' && change.dragging && change.position) {
        // send move message on drag stop
        store.moveNode(change.id, change.position.x, change.position.y)
      } else {
        store.applyNodeChange(change)
      }
    }
  }
}

export function useOnNodeDrag(socket: PageSocket): {
  onNodeDragStart: OnNodeDrag
  onNodeDragStop: OnNodeDrag
} {
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)

  const onNodeDragStart: OnNodeDrag = (event, node) => {
    setStartX(node.position.x)
    setStartY(node.position.y)
    event.preventDefault()
  }
  const onNodeDragStop: OnNodeDrag = (_event, node, nodes) => {
    if (startX !== node.position.x || startY !== node.position.y) {
      nodes.forEach((node) => socket.moveNode(node.id, node.position.x, node.position.y))
    }
  }

  return { onNodeDragStart, onNodeDragStop }
}

export function createOnPostNodeCreate(
  projectStore: ProjectStore,
  projectSocket: ProjectSocket,
  pageStore: PageStore,
  pageSocket: PageSocket,
  source: MutableRefObject<DragSource | null>,
): (projectNode: Node<ProjectNodeData>, position: XYPosition) => void {
  return (projectNode, position) => {
    const pageNode = extractPageNode(projectNode, position)

    projectStore.createNode(projectNode)
    projectSocket.createNode(projectNode)

    if (source.current) {
      const projectEdge = projectStore.findEdge(source.current.id, projectNode.id)
      if (projectEdge) {
        edgeDrawn(pageStore, pageSocket, pageNode, projectEdge)
      } else {
        newEdgeDrawn(projectStore, projectSocket, pageStore, pageSocket, pageNode, source.current.id, projectNode.id)
      }
    } else {
      paneClicked(pageStore, pageSocket, pageNode)
    }

    // reset drag start
    source.current = null
  }
}

export function createOnPostNodeSelect(
  projectStore: ProjectStore,
  projectSocket: ProjectSocket,
  pageStore: PageStore,
  pageSocket: PageSocket,
  source: MutableRefObject<DragSource | null>,
): (header: NodeHeader, position: XYPosition) => void {
  return (header, position) => {
    if (pageStore.isNodeExists(header.id)) return

    const pageNode = expandToPageNode(header, position)

    if (source.current) {
      const projectEdge = projectStore.findEdge(source.current.id, header.id)
      if (projectEdge && !pageStore.isEdgeExists(projectEdge.id)) {
        edgeDrawn(pageStore, pageSocket, pageNode, projectEdge)
      } else {
        newEdgeDrawn(projectStore, projectSocket, pageStore, pageSocket, pageNode, source.current.id, header.id)
      }
    } else {
      paneClicked(pageStore, pageSocket, pageNode)
    }

    // reset drag start
    source.current = null
  }
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
  pageStore.addNode(pageNode)
  pageSocket.addNode(pageNode)
}
