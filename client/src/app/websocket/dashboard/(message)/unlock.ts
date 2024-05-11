import z from 'zod'
import { SendJsonMessage, WebSocketLike } from 'react-use-websocket/src/lib/types'
import { ReadyState } from 'react-use-websocket'
import { Dispatch, SetStateAction } from 'react'

const unlockResponse = z.object({
  type: z.string(),
  object_id: z.string(),
})

export type UnlockResponse = z.infer<typeof unlockResponse>

function isUnlockResponse(value: unknown): value is UnlockResponse {
  const json = unlockResponse.safeParse(value)
  return json.success && json.data.type === 'unlock'
}

export function sendUnlockRequest(send: SendJsonMessage, socket: () => WebSocketLike | null) {
  if (socket()?.readyState === ReadyState.OPEN) {
    console.log('send unlock')
    send({ type: 'unlock', object_id: '1234' })
  } else {
    console.log('already disconnected')
  }
}

export function handleUnlockResponse(response: unknown, f: Dispatch<SetStateAction<string[]>>) {
  if (isUnlockResponse(response)) {
    f((messages) => messages.concat(`${response.type}: ${response.object_id}`).slice(-9))
  }
}
