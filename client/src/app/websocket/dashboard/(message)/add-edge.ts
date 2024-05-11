import z from 'zod'
import { SendJsonMessage, WebSocketLike } from 'react-use-websocket/src/lib/types'
import { ReadyState } from 'react-use-websocket'
import { Dispatch, SetStateAction } from 'react'

const addEdgeResponse = z.object({
  type: z.string(),
  object_id: z.string(),
  src: z.string(),
  dst: z.string(),
})

export type AddEdgeResponse = z.infer<typeof addEdgeResponse>

function isAddEdgeResponse(value: unknown): value is AddEdgeResponse {
  const json = addEdgeResponse.safeParse(value)
  return json.success && json.data.type === 'add-edge'
}

export function sendAddEdgeRequest(send: SendJsonMessage, socket: () => WebSocketLike | null) {
  if (socket()?.readyState === ReadyState.OPEN) {
    console.log('send add-edge')
    send({ type: 'add-edge', src: 'ab', dst: 'cd' })
  } else {
    console.log('already disconnected')
  }
}

export function handleAddEdgeResponse(response: unknown, f: Dispatch<SetStateAction<string[]>>) {
  if (isAddEdgeResponse(response)) {
    f((messages) =>
      messages.concat(`${response.type}: ${response.object_id} (${response.src} -> ${response.dst})`).slice(-9),
    )
  }
}
