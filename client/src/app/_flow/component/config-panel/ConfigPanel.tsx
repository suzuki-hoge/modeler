'use client'

import { useState } from 'react'
import { shallow } from 'zustand/shallow'

import { GearIcon } from '@/app/_component/icon/gear-icon/GearIcon'
import { Switch } from '@/app/_component/input/switch/Switch'
import { userSocketSelector, useUserSocket } from '@/app/_flow/socket/user-socket'
import { userStoreSelector, useUserStore } from '@/app/_flow/store/user-store'

import styles from './config-panel.module.scss'

export const ConfigPanel = () => {
  const userStore = useUserStore(userStoreSelector, shallow)
  const userSocket = useUserSocket(userSocketSelector, shallow)

  const [isOpened, setIsOpened] = useState(false)

  const setReflectPageObjectOnTextInput = (checked: boolean) => {
    const config = { ...userStore.config, ...{ reflectPageObjectOnTextInput: checked } }
    userStore.setConfig(config)
    userSocket.updateConfig(userStore.id, config)
  }

  const setShowBaseTypeAttributes = (checked: boolean) => {
    const config = { ...userStore.config, ...{ showBaseTypeAttributes: checked } }
    userStore.setConfig(config)
    userSocket.updateConfig(userStore.id, config)
  }

  const setShowInSecondLanguage = (checked: boolean) => {
    const config = { ...userStore.config, ...{ showInSecondLanguage: checked } }
    userStore.setConfig(config)
    userSocket.updateConfig(userStore.id, config)
  }

  return (
    <div className={styles.component}>
      <GearIcon size={'large'} onClick={() => setIsOpened((prev) => !prev)} />
      {isOpened && (
        <div className={styles.panels}>
          <div className={styles.config}>
            <span>テキストで作成したクラスを図に反映する</span>
            <Switch
              checked={userStore.config.reflectPageObjectOnTextInput}
              onToggle={setReflectPageObjectOnTextInput}
            />
          </div>
          <div className={styles.config}>
            <span>基底型の属性を表示する</span>
            <Switch checked={userStore.config.showBaseTypeAttributes} onToggle={setShowBaseTypeAttributes} />
          </div>
          <div className={styles.config}>
            <span>第二言語で表示する</span>
            <Switch checked={userStore.config.showInSecondLanguage} onToggle={setShowInSecondLanguage} />
          </div>
        </div>
      )}
    </div>
  )
}
