import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

// types

const type = 'update-name'

const updateNameRequest = z.object({
  type: z.string(),
  objectId: z.string(),
  name: z.string(),
})
type UpdateNameRequest = z.infer<typeof updateNameRequest>

const updateNameResponse = updateNameRequest
type UpdateNameResponse = z.infer<typeof updateNameResponse>

export type UpdateName = (objectId: string, name: string) => void

// send

export function createUpdateName(
  send: (request: UpdateNameRequest) => void,
  socket: () => WebSocketLike | null,
): UpdateName {
  return (objectId: string, name: string) => {
    if (socket()?.readyState === ReadyState.OPEN) {
      const request = { type, objectId, name }
      console.log(`--> ${JSON.stringify(request)}`)
      send(request)
    } else {
      console.log('already disconnected')
    }
  }
}

// handle

export function handleUpdateName(response: unknown, handler: (response: UpdateNameResponse) => void) {
  if (isUpdateNameResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    handler(response)
  }
}

function isUpdateNameResponse(value: unknown): value is UpdateNameResponse {
  const json = updateNameResponse.safeParse(value)
  return json.success && json.data.type === type
}
