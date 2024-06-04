import React, { useContext } from 'react'
import { Node, useReactFlow } from 'reactflow'

import { ClassSelectorVarsContext } from '@/app/_component/text/class-selector/ClassSelector'
import { Socket } from '@/app/_socket/socket'
import { NodeData } from '@/app/_store/node/type'
import { Store } from '@/app/_store/store'

export function useOnPaneClick(store: Store, socket: Socket): (event: React.MouseEvent<Element, MouseEvent>) => void {
  const reactFlowInstance = useReactFlow()
  const { setShowClassSelector, setNewNodePos, setApplyToNewNode } = useContext(ClassSelectorVarsContext)!

  return (event) => {
    // Windows control or macOS Command
    if ((event.ctrlKey && !event.metaKey) || (!event.ctrlKey && event.metaKey)) {
      const pos = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY })

      setShowClassSelector(true)
      setNewNodePos(pos)
      setApplyToNewNode(() => (node: Node<NodeData>) => {
        socket.addNode(node)
        store.updateNodes((nodes) => [...nodes, node])
      })
    }
  }
}
