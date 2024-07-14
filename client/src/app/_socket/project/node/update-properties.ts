import { ReadyState } from 'react-use-websocket'
import { WebSocketLike } from 'react-use-websocket/src/lib/types'
import z from 'zod'

import { ProjectStore } from '@/app/_store/project-store'

// types

const type = 'update-properties'

const updatePropertiesRequest = z.object({
  type: z.string(),
  objectId: z.string(),
  properties: z.array(z.string()),
})
type UpdatePropertiesRequest = z.infer<typeof updatePropertiesRequest>

const updatePropertiesResponse = updatePropertiesRequest
type UpdatePropertiesResponse = z.infer<typeof updatePropertiesResponse>

export type UpdateProperties = (objectId: string, properties: string[]) => void

// send

export function createUpdateProperties(
  send: (request: UpdatePropertiesRequest) => void,
  socket: () => WebSocketLike | null,
): UpdateProperties {
  return (objectId: string, properties: string[]) => {
    if (socket()?.readyState === ReadyState.OPEN) {
      const request = { type, objectId, properties }
      console.log(`--> ${JSON.stringify(request)}`)
      send(request)
    } else {
      console.log('already disconnected')
    }
  }
}

// handle

export function handleUpdateProperties(response: unknown, store: ProjectStore) {
  if (isUpdatePropertiesResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    store.updateNodeData(response.objectId, (data) => ({ ...data, properties: response.properties }))
  }
}

function isUpdatePropertiesResponse(value: unknown): value is UpdatePropertiesResponse {
  const json = updatePropertiesResponse.safeParse(value)
  return json.success && json.data.type === type
}
