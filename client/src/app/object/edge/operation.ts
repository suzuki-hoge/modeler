import { useRef } from 'react'
import { applyEdgeChanges, OnConnectEnd, OnConnectStart, OnEdgesChange } from 'reactflow'

import { ArrowType } from '@/app/component/marker/Arrows'
import { allocateEdgeId, createEdge } from '@/app/object/edge/function'
import { Store } from '@/app/object/store'
import { Socket } from '@/app/socket/socket'

export function useOnEdgesChange(store: Store, socket: Socket): OnEdgesChange {
  return (changes) => {
    for (const change of changes) {
      if (change.type === 'remove') {
        socket.deleteEdge(change.id)
      }
    }

    store.updateEdges((edges) => applyEdgeChanges(changes, edges))
  }
}

type OnConnect = { onConnectStart: OnConnectStart; onConnectEnd: OnConnectEnd }

export function useOnConnect(store: Store, socket: Socket): OnConnect {
  const source = useRef<{ id: string; type: ArrowType } | null>(null)

  const onConnectStart: OnConnectStart = (e, p) => {
    source.current = { id: p.nodeId!, type: p.handleId?.endsWith('v') ? 'v-arrow' : 'filled-arrow' }
  }

  const onConnectEnd: OnConnectEnd = (e) => {
    const event = e as MouseEvent
    const targetNodeIds = document
      .elementsFromPoint(event.clientX, event.clientY)
      .filter((e) => e.classList.contains('class-node'))
      .map((e) => e.id)

    if (targetNodeIds.length === 0) {
      console.log('new')
    } else if (source.current?.id !== targetNodeIds[0]) {
      const edge = createEdge(allocateEdgeId(), source.current!.id, targetNodeIds[0], source.current!.type, '1')

      socket.addEdge(edge)
      store.updateEdges((edges) => [...edges, edge])
    } else {
      console.log('nothing')
    }
  }

  return { onConnectStart, onConnectEnd }
}
