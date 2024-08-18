import { ReadyState } from 'react-use-websocket'
import z from 'zod'

import { UserConfig } from '@/app/_object/user/config/type'

// types

const type = 'update-user-config'

const updateUserConfigRequest = z.object({
  type: z.string(),
  reflectPageObjectOnTextInput: z.boolean(),
  showBaseTypeAttributes: z.boolean(),
  showInSecondLanguage: z.boolean(),
})
type updateUserConfigRequest = z.infer<typeof updateUserConfigRequest>

// send

type Sender = (request: updateUserConfigRequest) => void

export function sendUpdateUserConfig(sender: Sender, state: ReadyState, userId: string, config: UserConfig): void {
  if (state === ReadyState.OPEN) {
    const request = {
      type,
      userId,
      reflectPageObjectOnTextInput: config.reflectPageObjectOnTextInput,
      showBaseTypeAttributes: config.showBaseTypeAttributes,
      showInSecondLanguage: config.showInSecondLanguage,
    }
    console.log(`--> ${JSON.stringify(request)}`)
    sender(request)
  } else {
    console.log('already disconnected')
  }
}
