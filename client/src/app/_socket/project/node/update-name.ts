import { ReadyState } from 'react-use-websocket'
import z from 'zod'

import { PageStore } from '@/app/_store/page-store'
import { ProjectStore } from '@/app/_store/project-store'

// types

const type = 'update-name'

const updateNameRequest = z.object({
  type: z.string(),
  objectId: z.string(),
  name: z.string(),
})
type UpdateNameRequest = z.infer<typeof updateNameRequest>

const updateNameResponse = updateNameRequest
type UpdateNameResponse = z.infer<typeof updateNameResponse>

// send

type Sender = (request: UpdateNameRequest) => void

export function sendUpdateName(sender: Sender, state: ReadyState, objectId: string, name: string): void {
  if (state === ReadyState.OPEN) {
    const request = { type, objectId, name }
    console.log(`--> ${JSON.stringify(request)}`)
    sender(request)
  } else {
    console.log('already disconnected')
  }
}

// handle

export function handleUpdateName(response: unknown, projectStore: ProjectStore, pageStore: PageStore) {
  if (isUpdateNameResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    projectStore.updateNodeData(response.objectId, (data) => ({ ...data, name: response.name }))
    pageStore.modifyNode(response.objectId)
  }
}

function isUpdateNameResponse(value: unknown): value is UpdateNameResponse {
  const json = updateNameResponse.safeParse(value)
  return json.success && json.data.type === type
}
