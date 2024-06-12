import { useCallback } from 'react'
import { applyNodeChanges, Node, NodeDragHandler, OnNodesChange } from 'reactflow'

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

export function useOnNodeDragStop(socket: Socket): NodeDragHandler {
  return (_event, _node, nodes) => {
    nodes.forEach((node) => socket.moveNode(node.id, node.position.x, node.position.y))
  }
}

export function useOnPostNodeCreate(store: Store, socket: Socket, srcNodeId?: string): (node: Node<NodeData>) => void {
  return useCallback(
    (node) => {
      // todo: project node + page node
      store.updateNodes((nodes) => [...nodes, node])
      socket.addNode(node)

      if (srcNodeId) {
        const edge = createEdge(allocateEdgeId(), srcNodeId, node.id, 'simple', '1')
        store.updateEdges((edges) => [...edges, edge])
        socket.addEdge(edge)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
}

export function useOnPostNodeSelect(store: Store, socket: Socket, srcNodeId?: string): (header: NodeHeader) => void {
  return useCallback(
    (header) => {
      if (srcNodeId && !store.isEdgeExists(srcNodeId, header.id)) {
        const edge = createEdge(allocateEdgeId(), srcNodeId, header.id, 'simple', '1')
        store.updateEdges((edges) => [...edges, edge])
        socket.addEdge(edge)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
}
