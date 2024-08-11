import { OnConnectEnd, OnConnectStart, OnEdgesChange, useReactFlow } from '@xyflow/react'
import { MutableRefObject, useCallback, useRef } from 'react'

import { SelectorState } from '@/app/_hook/pane'
import { allocateEdgeId, createEdge, extractPageEdge } from '@/app/_object/edge/function'
import { ArrowType } from '@/app/_object/edge/type'
import { PageSocket } from '@/app/_socket/page-socket'
import { ProjectSocket } from '@/app/_socket/project-socket'
import { PageStore } from '@/app/_store/page-store'
import { ProjectStore } from '@/app/_store/project-store'

export function useOnEdgesChange(store: PageStore, socket: PageSocket): OnEdgesChange {
  return (changes) => {
    for (const change of changes) {
      if (change.type === 'remove') {
        socket.removeEdge(change.id)
        store.removeEdge(change.id)
        store.applyEdgeChange(change)
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
  source: MutableRefObject<DragSource | null>
}

export function useOnConnect(
  projectStore: ProjectStore,
  projectSocket: ProjectSocket,
  pageStore: PageStore,
  pageSocket: PageSocket,
  selectorState: SelectorState,
): OnConnect {
  const source = useRef<DragSource | null>(null)
  const rf = useReactFlow()

  const onConnectStart: OnConnectStart = useCallback((_, p) => {
    source.current = { id: p.nodeId!, arrowType: p.handleId?.startsWith('simple') ? 'simple' : 'generalization' }
  }, [])

  const onConnectEnd: OnConnectEnd = useCallback(
    (e) => {
      const event = e as MouseEvent

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
      } else if (source.current!.id !== targetNodeIds[0]) {
        // connect
        const projectEdge = projectStore.findEdge(source.current!.id, targetNodeIds[0])

        if (projectEdge && !pageStore.isEdgeExists(projectEdge.id)) {
          const pageEdge = extractPageEdge(projectEdge)

          pageStore.addEdge(pageEdge)
          pageSocket.addEdge(pageEdge)
        } else {
          const projectEdge = createEdge(
            allocateEdgeId(),
            source.current!.id,
            targetNodeIds[0],
            source.current!.arrowType,
            '1',
          )

          projectStore.createEdge(projectEdge)
          projectSocket.createEdge(projectEdge)

          const pageEdge = extractPageEdge(projectEdge)

          pageStore.addEdge(pageEdge)
          pageSocket.addEdge(pageEdge)
        }
      } else {
        // do nothing
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return { onConnectStart, onConnectEnd, source }
}
