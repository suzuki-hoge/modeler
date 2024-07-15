import { Set } from 'immutable'
import { Dispatch, SetStateAction, useState } from 'react'
import { OnConnectEnd, OnConnectStart, OnEdgesChange, useReactFlow } from 'reactflow'

import { SelectorState } from '@/app/_hook/pane'
import { allocateEdgeId, createEdge, extractPageEdge } from '@/app/_object/edge/function'
import { ArrowType } from '@/app/_object/edge/type'
import { PageSocket2 } from '@/app/_socket/page-socket'
import { ProjectSocket2 } from '@/app/_socket/project-socket'
import { PageStore } from '@/app/_store/page-store'
import { ProjectStore } from '@/app/_store/project-store'

export function useOnEdgesChange(store: PageStore, socket: PageSocket2): OnEdgesChange {
  return (changes) => {
    for (const change of changes) {
      if (change.type === 'remove') {
        socket.removeNode(change.id)
        store.removeNode(change.id)
      } else {
        store.applyEdgeChange(change)
      }
    }
  }
}

export interface DragSource {
  id: string
  arrowType: ArrowType
}

interface OnConnect {
  onConnectStart: OnConnectStart
  onConnectEnd: OnConnectEnd
  source: DragSource | null
  setSource: Dispatch<SetStateAction<DragSource | null>>
}

export function useOnConnect(
  projectStore: ProjectStore,
  projectSocket: ProjectSocket2,
  pageStore: PageStore,
  pageSocket: PageSocket2,
  selectorState: SelectorState,
): OnConnect {
  const [source, setSource] = useState<DragSource | null>(null)
  const rf = useReactFlow()

  const onConnectStart: OnConnectStart = (_, p) => {
    setSource({ id: p.nodeId!, arrowType: p.handleId?.startsWith('simple') ? 'simple' : 'generalization' })
  }

  const onConnectEnd: OnConnectEnd = (e) => {
    const event = e as MouseEvent
    const sourceNodeIds = Set([
      // ...projectStore.nodes.filter((node) => node.selected).map((node) => node.id),
      // source!.id,
    ])

    const targetNodeIds = document
      .elementsFromPoint(event.clientX, event.clientY)
      .filter((e) => e.classList.contains('class-node'))
      .map((e) => e.id)

    if (targetNodeIds.length === 0) {
      // create new node
      const screen = { x: event.clientX, y: event.clientY }
      const flow = rf.screenToFlowPosition(screen)
      selectorState.setActive(true)
      selectorState.setPosition({ screen, flow })
    } else if (source?.id !== targetNodeIds[0]) {
      // connect
      sourceNodeIds.forEach((sourceNodeId) => {
        const projectEdge = projectStore.findEdge(sourceNodeId, targetNodeIds[0])

        if (projectEdge && !pageStore.isEdgeExists(projectEdge.id)) {
          const pageEdge = extractPageEdge(projectEdge)

          pageStore.addEdge(pageEdge)
          pageSocket.addEdge(pageEdge)
        } else {
          const projectEdge = createEdge(allocateEdgeId(), sourceNodeId, targetNodeIds[0], source!.arrowType, '1')

          projectStore.createEdge(projectEdge)
          projectSocket.createEdge(projectEdge)

          const pageEdge = extractPageEdge(projectEdge)

          pageStore.addEdge(pageEdge)
          pageSocket.addEdge(pageEdge)
        }
      })
    } else {
      // do nothing
    }
  }

  return { onConnectStart, onConnectEnd, source, setSource }
}
