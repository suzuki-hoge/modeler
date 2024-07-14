import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import { Edge } from 'reactflow'
import z from 'zod'

import { updateEdge } from '@/app/_object/edge/function'
import { ProjectEdgeData } from '@/app/_object/edge/type'
import { ProjectStore } from '@/app/_store/project-store'

// types

const type = 'update-connection'

const updateConnectionRequest = z.object({
  type: z.string(),
  objectId: z.string(),
  source: z.string(),
  target: z.string(),
})
type UpdateConnectionRequest = z.infer<typeof updateConnectionRequest>

const updateConnectionResponse = updateConnectionRequest
type UpdateConnectionResponse = z.infer<typeof updateConnectionResponse>

export type UpdateConnection = (edge: Edge<ProjectEdgeData>) => void

// send

export function createUpdateConnection(
  send: (request: UpdateConnectionRequest) => void,
  socket: () => WebSocketLike | null,
): UpdateConnection {
  return (edge: Edge<ProjectEdgeData>) => {
    if (socket()?.readyState === ReadyState.OPEN) {
      const request = {
        type,
        objectId: edge.id,
        source: edge.source,
        target: edge.target,
      }
      console.log(`--> ${JSON.stringify(request)}`)
      send(request)
    } else {
      console.log('already disconnected')
    }
  }
}

// handle

export function handleUpdateConnection(response: unknown, store: ProjectStore) {
  if (isUpdateConnectionResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    store.updateEdge(response.objectId, (edge) => updateEdge(edge, response))
  }
}

function isUpdateConnectionResponse(value: unknown): value is UpdateConnectionResponse {
  const json = updateConnectionResponse.safeParse(value)
  return json.success && json.data.type === type
}
