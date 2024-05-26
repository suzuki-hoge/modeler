import React, { useContext } from 'react'
import { Node, useReactFlow } from 'reactflow'

import { ClassSelectorVarsContext } from '@/app/component/class-selector/ClassSelector'
import { NodeData } from '@/app/object/node/type'
import { Store } from '@/app/object/store'
import { Socket } from '@/app/socket/socket'

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
