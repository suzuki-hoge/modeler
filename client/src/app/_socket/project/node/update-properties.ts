import { ReadyState } from 'react-use-websocket'
import z from 'zod'

import { PageStore } from '@/app/_store/page-store'
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

type Sender = (request: UpdatePropertiesRequest) => void

export function sendUpdateProperties(sender: Sender, state: ReadyState, objectId: string, properties: string[]): void {
  if (state === ReadyState.OPEN) {
    const request = { type, objectId, properties }
    console.log(`--> ${JSON.stringify(request)}`)
    sender(request)
  } else {
    console.log('already disconnected')
  }
}

// handle

export function handleUpdateProperties(response: unknown, store: ProjectStore, pageStore: PageStore) {
  if (isUpdatePropertiesResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    store.updateNodeData(response.objectId, (data) => ({ ...data, properties: response.properties }))
    pageStore.modifyNode(response.objectId)
  }
}

function isUpdatePropertiesResponse(value: unknown): value is UpdatePropertiesResponse {
  const json = updatePropertiesResponse.safeParse(value)
  return json.success && json.data.type === type
}
