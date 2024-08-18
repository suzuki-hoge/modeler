import { ReadyState } from 'react-use-websocket/src/lib/constants'
import { SendJsonMessage } from 'react-use-websocket/src/lib/types'
import { createWithEqualityFn } from 'zustand/traditional'

import { UserConfig } from '@/app/_object/user/config/type'
import { sendUpdateUserConfig } from '@/app/_socket/user/config/update-user-config'

type UserSocketWithState = {
  updateConfig: (userId: string, config: UserConfig) => void

  // init
  sender: SendJsonMessage | null
  readyState: ReadyState
  initSender: (sender: SendJsonMessage) => void
  initState: (readyState: ReadyState) => void
}

export type UserSocket = Omit<UserSocketWithState, 'sender' | 'readyState'>

export const userSocketSelector = (socket: UserSocketWithState) => ({
  updateConfig: socket.updateConfig,

  // init
  initSender: socket.initSender,
  initState: socket.initState,
})

export const useUserSocket = createWithEqualityFn<UserSocketWithState>((set, get) => ({
  updateConfig: (userId: string, config: UserConfig) => {
    get().sender && sendUpdateUserConfig(get().sender!, get().readyState, userId, config)
  },

  // init
  sender: null,
  readyState: -1,
  initSender: (sender) => set({ sender }),
  initState: (readyState) => set({ readyState }),
}))
