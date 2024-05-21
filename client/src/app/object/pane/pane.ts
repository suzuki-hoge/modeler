import { useReactFlow } from 'reactflow'

import { allocateNodeId, createNode } from '@/app/object/node/function'
import { Store } from '@/app/object/store'
import { Socket } from '@/app/socket/socket'

export function useOnPaneClick(store: Store, socket: Socket): (event: React.MouseEvent<Element, MouseEvent>) => void {
  const reactFlowInstance = useReactFlow()
  return (event) => {
    const id = allocateNodeId()
    const pos = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY })
    const node = createNode(id, pos.x, pos.y)

    socket.addNode(node)
    store.updateNodes((nodes) => [...nodes, node])
  }
}
