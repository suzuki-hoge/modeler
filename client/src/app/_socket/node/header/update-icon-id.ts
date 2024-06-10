import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

// types

const type = 'update-icon-id'

const updateIconRequest = z.object({
  type: z.string(),
  objectId: z.string(),
  iconId: z.string(),
})
type UpdateIconIdRequest = z.infer<typeof updateIconRequest>

const updateIconResponse = updateIconRequest
type UpdateIconIdResponse = z.infer<typeof updateIconResponse>

export type UpdateIconId = (objectId: string, iconId: string) => void

// send

export function createUpdateIconId(
  send: (request: UpdateIconIdRequest) => void,
  socket: () => WebSocketLike | null,
): UpdateIconId {
  return (objectId: string, iconId: string) => {
    if (socket()?.readyState === ReadyState.OPEN) {
      const request = { type, objectId, iconId }
      console.log(`--> ${JSON.stringify(request)}`)
      send(request)
    } else {
      console.log('already disconnected')
    }
  }
}

// handle

export function handleUpdateIconId(response: unknown, handler: (response: UpdateIconIdResponse) => void) {
  if (isUpdateIconIdResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    handler(response)
  }
}

function isUpdateIconIdResponse(value: unknown): value is UpdateIconIdResponse {
  const json = updateIconResponse.safeParse(value)
  return json.success && json.data.type === type
}
