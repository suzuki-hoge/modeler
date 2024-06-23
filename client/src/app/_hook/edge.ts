import { Set } from 'immutable'
import { Dispatch, SetStateAction, useState } from 'react'
import { OnConnectEnd, OnConnectStart, OnEdgesChange } from 'reactflow'

import { SelectorState } from '@/app/_hook/pane'
import { allocateEdgeId, createEdge } from '@/app/_object/edge/function'
import { ArrowType } from '@/app/_object/edge/type'
import { ProjectSocket } from '@/app/_socket/project-socket'
import { ProjectStore } from '@/app/_store/project-store'

export function useOnEdgesChange(store: ProjectStore, socket: ProjectSocket): OnEdgesChange {
  return (changes) => {
    for (const change of changes) {
      if (change.type === 'remove') {
        socket.deleteEdge(change.id)
        store.deleteEdge(change.id)
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

export function useOnConnect(store: ProjectStore, socket: ProjectSocket, selectorState: SelectorState): OnConnect {
  const [source, setSource] = useState<DragSource | null>(null)

  const onConnectStart: OnConnectStart = (_, p) => {
    setSource({ id: p.nodeId!, arrowType: p.handleId?.startsWith('simple') ? 'simple' : 'generalization' })
  }

  const onConnectEnd: OnConnectEnd = (e) => {
    const event = e as MouseEvent
    const sourceNodeIds = Set([...store.nodes.filter((node) => node.selected).map((node) => node.id), source!.id])

    const targetNodeIds = document
      .elementsFromPoint(event.clientX, event.clientY)
      .filter((e) => e.classList.contains('class-node'))
      .map((e) => e.id)

    if (targetNodeIds.length === 0) {
      // create new node
      selectorState.setActive(true)
      selectorState.setX(event.clientX)
      selectorState.setY(event.clientY)
    } else if (source?.id !== targetNodeIds[0]) {
      // connect
      sourceNodeIds.forEach((sourceNodeId) => {
        const edge = createEdge(allocateEdgeId(), sourceNodeId, targetNodeIds[0], source!.arrowType, '1')

        socket.createEdge(edge)
        store.createEdge(edge)
      })
    } else {
      // do nothing
    }
  }

  return { onConnectStart, onConnectEnd, source, setSource }
}
