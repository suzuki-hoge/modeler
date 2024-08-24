import toast from 'react-hot-toast'
import { ReadyState } from 'react-use-websocket'
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

// send

type Sender = (request: DeleteNodeRequest) => void

export function sendDeleteNode(sender: Sender, state: ReadyState, objectId: string): void {
  if (state === ReadyState.OPEN) {
    const request = { type, objectId }
    console.log(`--> ${JSON.stringify(request)}`)
    sender(request)
  } else {
    toast.error('Disconnected.')
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
