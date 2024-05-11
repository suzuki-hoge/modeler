import z from 'zod'
import { SendJsonMessage, WebSocketLike } from 'react-use-websocket/src/lib/types'
import { ReadyState } from 'react-use-websocket'
import { Dispatch, SetStateAction } from 'react'

const disconnectResponse = z.object({
  type: z.string(),
  session_id: z.string(),
  user: z.string(),
})

export type DisconnectResponse = z.infer<typeof disconnectResponse>

function isDisconnectResponse(value: unknown): value is DisconnectResponse {
  const json = disconnectResponse.safeParse(value)
  return json.success && json.data.type === 'disconnect'
}

export function sendDisconnectRequest(send: SendJsonMessage, socket: () => WebSocketLike | null) {
  if (socket()?.readyState === ReadyState.OPEN) {
    console.log('send disconnected')
    socket()?.close()
  } else {
    console.log('already disconnected')
  }
}

export function handleDisconnectResponse(response: unknown, f: Dispatch<SetStateAction<string[]>>) {
  if (isDisconnectResponse(response)) {
    f((messages) => messages.concat(`${response.type}: ${response.user}`).slice(-9))
  }
}
