import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

// types

const type = 'update-property'

const updatePropertyRequest = z.object({
  type: z.string(),
  objectId: z.string(),
  property: z.string(),
  n: z.number(),
})
type UpdatePropertyRequest = z.infer<typeof updatePropertyRequest>

const updatePropertyResponse = updatePropertyRequest
type UpdatePropertyResponse = z.infer<typeof updatePropertyResponse>

export type UpdateProperty = (objectId: string, property: string, n: number) => void

// send

export function createUpdateProperty(
  send: (request: UpdatePropertyRequest) => void,
  socket: () => WebSocketLike | null,
): UpdateProperty {
  return (objectId: string, property: string, n: number) => {
    if (socket()?.readyState === ReadyState.OPEN) {
      const request = { type, objectId, property, n }
      console.log(`--> ${JSON.stringify(request)}`)
      send(request)
    } else {
      console.log('already disconnected')
    }
  }
}

// handle

export function handleUpdateProperty(response: unknown, handler: (response: UpdatePropertyResponse) => void) {
  if (isUpdatePropertyResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    handler(response)
  }
}

function isUpdatePropertyResponse(value: unknown): value is UpdatePropertyResponse {
  const json = updatePropertyResponse.safeParse(value)
  return json.success && json.data.type === type
}
