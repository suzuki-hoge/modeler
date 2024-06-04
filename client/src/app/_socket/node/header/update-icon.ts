import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

// types

const type = 'update-icon'

const updateIconRequest = z.object({
  type: z.string(),
  objectId: z.string(),
  icon: z.string(),
})
type UpdateIconRequest = z.infer<typeof updateIconRequest>

const updateIconResponse = updateIconRequest
type UpdateIconResponse = z.infer<typeof updateIconResponse>

export type UpdateIcon = (objectId: string, icon: string) => void

// send

export function createUpdateIcon(
  send: (request: UpdateIconRequest) => void,
  socket: () => WebSocketLike | null,
): UpdateIcon {
  return (objectId: string, icon: string) => {
    if (socket()?.readyState === ReadyState.OPEN) {
      const request = { type, objectId, icon }
      console.log(`--> ${JSON.stringify(request)}`)
      send(request)
    } else {
      console.log('already disconnected')
    }
  }
}

// handle

export function handleUpdateIcon(response: unknown, handler: (response: UpdateIconResponse) => void) {
  if (isUpdateIconResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    handler(response)
  }
}

function isUpdateIconResponse(value: unknown): value is UpdateIconResponse {
  const json = updateIconResponse.safeParse(value)
  return json.success && json.data.type === type
}
