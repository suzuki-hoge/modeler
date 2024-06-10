import { applyNodeChanges, NodeDragHandler, OnNodesChange } from 'reactflow'

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
