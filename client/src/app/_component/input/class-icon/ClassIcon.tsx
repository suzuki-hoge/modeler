'use client'
import React from 'react'

import { CharIcon } from '@/app/_component/icon/char-icon/CharIcon'
import { IconText } from '@/app/_component/icon/icon-text/IconText'
import { Popup, usePopup } from '@/app/_component/selector/Popup'
import { Selector } from '@/app/_component/selector/Selector'
import { NodeIcon } from '@/app/_object/node/type'

import styles from './class-icon.module.scss'

interface Props {
  iconId: string
  icons: NodeIcon[]
  readonly: boolean
  onChange: (icon: NodeIcon) => void
}

export const ClassIcon = (props: Props) => {
  const { popupState, openPopup, closePopup } = usePopup()

  const icon = props.icons.find((icon) => icon.id === props.iconId)

  return (
    <div className={styles.component}>
      <CharIcon char={icon?.preview || 'C'} color={icon?.color || 'transparent'} onClick={openPopup} />
      {!props.readonly && (
        <Popup popupState={popupState} closePopup={closePopup}>
          <Selector
            width={`${8 + Math.max(...props.icons.map((icon) => icon.desc.length))}ch`}
            placeholder={'icon...'}
            choices={props.icons}
            preview={(icon) => <IconText preview={icon.preview} color={icon.color} desc={icon.desc} />}
            search={['preview', 'desc']}
            onSelect={props.onChange}
          />
        </Popup>
      )}
    </div>
  )
}
