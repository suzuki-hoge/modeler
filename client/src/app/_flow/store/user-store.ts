import { createWithEqualityFn } from 'zustand/traditional'

import { UserConfig } from '@/app/_flow/object/user/type'

type UserStore = {
  // user
  id: string
  name: string
  icon: string

  // config
  config: UserConfig
  setConfig: (config: UserConfig) => void

  // init
  putUser: (id: string, name: string, icon: string) => void
}

export const userStoreSelector = (store: UserStore) => ({
  // user
  id: store.id,
  name: store.name,
  icon: store.icon,

  // config
  config: store.config,
  setConfig: store.setConfig,

  // init
  putUser: store.putUser,
})

export const useUserStore = createWithEqualityFn<UserStore>((set) => ({
  // user
  id: '',
  name: '',
  icon: '',

  // config
  config: { reflectPageObjectOnTextInput: false, showBaseTypeAttributes: false, showInSecondLanguage: false },
  setConfig: (config: UserConfig) => set({ config }),

  // init
  putUser: (id: string, name: string, icon: string) => set({ id, name, icon }),
}))
