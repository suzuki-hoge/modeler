import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { applyNodeChanges, Node, NodeDragHandler, OnNodesChange } from 'reactflow'

import { DragSource } from '@/app/_hook/edge'
import { allocateEdgeId, createEdge } from '@/app/_object/edge/function'
import { NodeData, NodeHeader } from '@/app/_object/node/type'
import { Socket } from '@/app/_socket/socket'
import { Store } from '@/app/_store/store'

export function useOnNodesChange(store: Store, socket: Socket): OnNodesChange {
  return (changes) => {
    for (const change of changes) {
      if (change.type === 'remove') {
        socket.deleteNode(change.id)
      }
    }

    store.updateNodes((nodes) => applyNodeChanges(changes, nodes))
  }
}

export function useOnNodeDrag(socket: Socket): { onNodeDragStart: NodeDragHandler; onNodeDragStop: NodeDragHandler } {
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
  store: Store,
  socket: Socket,
  source: DragSource | null,
  setSource: Dispatch<SetStateAction<DragSource | null>>,
): (node: Node<NodeData>) => void {
  return useCallback(
    (node) => {
      // todo: project node + page node
      store.updateNodes((nodes) => [...nodes, node])
      socket.addNode(node)

      if (source) {
        const edge = createEdge(allocateEdgeId(), source.id, node.id, 'simple', '1')
        store.updateEdges((edges) => [...edges, edge])
        socket.addEdge(edge)
      }

      setSource(null)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [source],
  )
}

export function useOnPostNodeSelect(
  store: Store,
  socket: Socket,
  source: DragSource | null,
  setSource: Dispatch<SetStateAction<DragSource | null>>,
): (header: NodeHeader) => void {
  return useCallback(
    (header) => {
      if (source && !store.isEdgeExists(source.id, header.id)) {
        const edge = createEdge(allocateEdgeId(), source.id, header.id, 'simple', '1')
        store.updateEdges((edges) => [...edges, edge])
        socket.addEdge(edge)
      }

      setSource(null)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [source],
  )
}
