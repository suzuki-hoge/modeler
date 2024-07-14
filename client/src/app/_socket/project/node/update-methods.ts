import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

import { ProjectStore } from '@/app/_store/project-store'

// types

const type = 'update-methods'

const updateMethodsRequest = z.object({
  type: z.string(),
  objectId: z.string(),
  methods: z.array(z.string()),
})
type UpdateMethodsRequest = z.infer<typeof updateMethodsRequest>

const updateMethodsResponse = updateMethodsRequest
type UpdateMethodsResponse = z.infer<typeof updateMethodsResponse>

export type UpdateMethods = (objectId: string, methods: string[]) => void

// send

export function createUpdateMethods(
  send: (request: UpdateMethodsRequest) => void,
  socket: () => WebSocketLike | null,
): UpdateMethods {
  return (objectId: string, methods: string[]) => {
    if (socket()?.readyState === ReadyState.OPEN) {
      const request = { type, objectId, methods }
      console.log(`--> ${JSON.stringify(request)}`)
      send(request)
    } else {
      console.log('already disconnected')
    }
  }
}

// handle

export function handleUpdateMethods(response: unknown, store: ProjectStore) {
  if (isUpdateMethodsResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    store.updateNodeData(response.objectId, (data) => ({ ...data, methods: response.methods }))
  }
}

function isUpdateMethodsResponse(value: unknown): value is UpdateMethodsResponse {
  const json = updateMethodsResponse.safeParse(value)
  return json.success && json.data.type === type
}
