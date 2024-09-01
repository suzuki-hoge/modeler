import { Node, OnNodeDrag, OnNodesChange } from '@xyflow/react'
import { useState } from 'react'

import { PageNodeData } from '@/app/_flow/object/node/type'
import { PageSocket } from '@/app/_flow/socket/page-socket'
import { PageStore } from '@/app/_flow/store/page-store'

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
