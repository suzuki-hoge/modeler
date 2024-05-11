import z from 'zod'
import { SendJsonMessage, WebSocketLike } from 'react-use-websocket/src/lib/types'
import { ReadyState } from 'react-use-websocket'
import { Dispatch, SetStateAction } from 'react'
import { isConnectResponse } from '@/app/websocket/dashboard/(message)/connect'

const addNodeResponse = z.object({
  type: z.string(),
  object_id: z.string(),
  x: z.number(),
  y: z.number(),
})

export type AddNodeResponse = z.infer<typeof addNodeResponse>

function isAddNodeResponse(value: unknown): value is AddNodeResponse {
  const json = addNodeResponse.safeParse(value)
  return json.success && json.data.type === 'add-node'
}

export function sendAddNodeRequest(send: SendJsonMessage, socket: () => WebSocketLike | null) {
  if (socket()?.readyState === ReadyState.OPEN) {
    console.log('send add-node')
    send({ type: 'add-node', x: 12, y: 34 })
  } else {
    console.log('already disconnected')
  }
}

export function handleAddNodeResponse(response: unknown, f: Dispatch<SetStateAction<string[]>>) {
  if (isAddNodeResponse(response)) {
    f((messages) => messages.concat(`${response.type}: ${response.object_id} (${response.x}, ${response.y})`).slice(-9))
  }
}
