import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

// types

const disconnectResponse = z.object({
  type: z.string(),
  session_id: z.string(),
  user: z.string(),
})
export type DisconnectResponse = z.infer<typeof disconnectResponse>

// send

export function sendDisconnectRequest(socket: () => WebSocketLike | null) {
  if (socket()?.readyState === ReadyState.OPEN) {
    console.log('send disconnect')
    socket()?.close()
  } else {
    console.log('already disconnected')
  }
}

// receive

export function handleDisconnectResponse(response: unknown) {
  if (isDisconnectResponse(response)) {
    console.log('handle disconnect')
  }
}

export function isDisconnectResponse(value: unknown): value is DisconnectResponse {
  const json = disconnectResponse.safeParse(value)
  return json.success && json.data.type === 'disconnect'
}
