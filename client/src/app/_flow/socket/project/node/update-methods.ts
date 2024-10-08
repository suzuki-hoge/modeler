import toast from 'react-hot-toast'
import { ReadyState } from 'react-use-websocket'
import z from 'zod'

import { PageStore } from '@/app/_flow/store/page-store' // types
import { ProjectStore } from '@/app/_flow/store/project-store'

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

// send

type Sender = (request: UpdateMethodsRequest) => void

export function sendUpdateMethods(sender: Sender, state: ReadyState, objectId: string, methods: string[]): void {
  if (state === ReadyState.OPEN) {
    const request = { type, objectId, methods }
    console.log(`--> ${JSON.stringify(request)}`)
    sender(request)
  } else {
    toast.error('Disconnected.')
  }
}

// handle

export function handleUpdateMethods(response: unknown, store: ProjectStore, pageStore: PageStore) {
  if (isUpdateMethodsResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    store.updateNodeData(response.objectId, (data) => ({ ...data, methods: response.methods }))
    pageStore.modifyNode(response.objectId)
  }
}

function isUpdateMethodsResponse(value: unknown): value is UpdateMethodsResponse {
  const json = updateMethodsResponse.safeParse(value)
  return json.success && json.data.type === type
}
