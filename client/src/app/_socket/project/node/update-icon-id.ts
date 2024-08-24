import toast from 'react-hot-toast'
import { ReadyState } from 'react-use-websocket'
import z from 'zod'

import { PageStore } from '@/app/_store/page-store'
import { ProjectStore } from '@/app/_store/project-store'

// types

const type = 'update-icon-id'

const updateIconRequest = z.object({
  type: z.string(),
  objectId: z.string(),
  iconId: z.string(),
})
type UpdateIconIdRequest = z.infer<typeof updateIconRequest>

const updateIconResponse = updateIconRequest
type UpdateIconIdResponse = z.infer<typeof updateIconResponse>

// send

type Sender = (request: UpdateIconIdRequest) => void

export function sendUpdateIconId(sender: Sender, state: ReadyState, objectId: string, iconId: string): void {
  if (state === ReadyState.OPEN) {
    const request = { type, objectId, iconId }
    console.log(`--> ${JSON.stringify(request)}`)
    sender(request)
  } else {
    toast.error('Disconnected.')
  }
}

// handle

export function handleUpdateIconId(response: unknown, store: ProjectStore, pageStore: PageStore) {
  if (isUpdateIconIdResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    store.updateNodeData(response.objectId, (data) => ({ ...data, iconId: response.iconId }))
    pageStore.modifyNode(response.objectId)
  }
}

function isUpdateIconIdResponse(value: unknown): value is UpdateIconIdResponse {
  const json = updateIconResponse.safeParse(value)
  return json.success && json.data.type === type
}
