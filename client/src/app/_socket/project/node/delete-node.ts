import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

import { ProjectStore } from '@/app/_store/project-store'

// types

const type = 'delete-node'

const deleteNodeRequest = z.object({
  type: z.string(),
  objectId: z.string(),
})
type DeleteNodeRequest = z.infer<typeof deleteNodeRequest>

const deleteNodeResponse = deleteNodeRequest
type DeleteNodeResponse = z.infer<typeof deleteNodeResponse>

export type DeleteNode = (objectId: string) => void

// send

export function createDeleteNode(
  send: (request: DeleteNodeRequest) => void,
  socket: () => WebSocketLike | null,
): DeleteNode {
  return (objectId: string) => {
    if (socket()?.readyState === ReadyState.OPEN) {
      const request = { type, objectId }
      console.log(`--> ${JSON.stringify(request)}`)
      send(request)
    } else {
      console.log('already disconnected')
    }
  }
}

// handle

export function handleDeleteNode(response: unknown, store: ProjectStore) {
  if (isDeleteNodeResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    store.deleteNode(response.objectId)
  }
}

function isDeleteNodeResponse(value: unknown): value is DeleteNodeResponse {
  const json = deleteNodeResponse.safeParse(value)
  return json.success && json.data.type === type
}
