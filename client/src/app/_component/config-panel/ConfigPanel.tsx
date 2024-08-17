'use client'

import { useState } from 'react'

import { GearIcon } from '@/app/_component/icon/gear-icon/GearIcon'
import { Switch } from '@/app/_component/input/switch/Switch'

import styles from './config-panel.module.scss'

export const ConfigPanel = () => {
  const [isOpened, setIsOpened] = useState(false)

  const [a, setA] = useState(true)
  const [b, setB] = useState(false)
  const [c, setC] = useState(false)

  return (
    <div className={styles.component}>
      <GearIcon size={'large'} onClick={() => setIsOpened((prev) => !prev)} />
      {isOpened && (
        <div className={styles.panels}>
          <div className={styles.config}>
            <span>テキストで作成したクラスを図に反映する</span>
            <Switch checked={a} onToggle={setA} />
          </div>
          <div className={styles.config}>
            <span>基底型のメソッドを表示する</span>
            <Switch checked={b} onToggle={setB} />
          </div>
          <div className={styles.config}>
            <span>第二言語で表示する</span>
            <Switch checked={c} onToggle={setC} />
          </div>
        </div>
      )}
    </div>
  )
}
