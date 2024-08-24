import toast from 'react-hot-toast'
import { ReadyState } from 'react-use-websocket'
import z from 'zod'

import { ProjectStore } from '@/app/_store/project-store'

// types

const type = 'delete-edge'

const deleteEdgeRequest = z.object({
  type: z.string(),
  objectId: z.string(),
})
type DeleteEdgeRequest = z.infer<typeof deleteEdgeRequest>

const deleteEdgeResponse = deleteEdgeRequest
type DeleteEdgeResponse = z.infer<typeof deleteEdgeResponse>

// send

type Sender = (request: DeleteEdgeRequest) => void

export function sendDeleteEdge(sender: Sender, state: ReadyState, objectId: string): void {
  if (state === ReadyState.OPEN) {
    const request = { type, objectId }
    console.log(`--> ${JSON.stringify(request)}`)
    sender(request)
  } else {
    toast.error('Disconnected.')
  }
}

// handle

export function handleDeleteEdge(response: unknown, store: ProjectStore) {
  if (isDeleteEdgeResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    store.deleteEdge(response.objectId)
  }
}

function isDeleteEdgeResponse(value: unknown): value is DeleteEdgeResponse {
  const json = deleteEdgeResponse.safeParse(value)
  return json.success && json.data.type === type
}
