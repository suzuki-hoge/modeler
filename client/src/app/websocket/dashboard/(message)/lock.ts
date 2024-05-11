import z from 'zod'
import { SendJsonMessage, WebSocketLike } from 'react-use-websocket/src/lib/types'
import { ReadyState } from 'react-use-websocket'
import { Dispatch, SetStateAction } from 'react'

const lockResponse = z.object({
  type: z.string(),
  object_id: z.string(),
})

export type LockResponse = z.infer<typeof lockResponse>

function isLockResponse(value: unknown): value is LockResponse {
  const json = lockResponse.safeParse(value)
  return json.success && json.data.type === 'lock'
}

export function sendLockRequest(send: SendJsonMessage, socket: () => WebSocketLike | null) {
  if (socket()?.readyState === ReadyState.OPEN) {
    console.log('send lock')
    send({ type: 'lock', object_id: '1234' })
  } else {
    console.log('already disconnected')
  }
}

export function handleLockResponse(response: unknown, f: Dispatch<SetStateAction<string[]>>) {
  if (isLockResponse(response)) {
    f((messages) => messages.concat(`${response.type}: ${response.object_id}`).slice(-9))
  }
}
