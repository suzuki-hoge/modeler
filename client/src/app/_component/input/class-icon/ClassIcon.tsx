'use client'
import React from 'react'

import { CharIcon } from '@/app/_component/icon/char-icon/CharIcon'
import { IconText } from '@/app/_component/icon/icon-text/IconText'
import { PopupSelector } from '@/app/_component/selector-base/popup-selector/PopupSelector'
import { usePopup } from '@/app/_hook/popup'
import { NodeIcon } from '@/app/_object/node/type'

import styles from './class-icon.module.scss'

interface Props {
  iconId: string
  icons: NodeIcon[]
  readonly: boolean
  onChange: (icon: NodeIcon) => void
}

export const ClassIcon = (props: Props) => {
  const { popupState, setPopupState, openPopup, closePopup } = usePopup()
  const icon = props.icons.find((icon) => icon.id === props.iconId)

  return (
    <div className={styles.component}>
      <CharIcon char={icon?.preview || 'C'} color={icon?.color || 'transparent'} onClick={openPopup} />
      {!props.readonly && (
        <PopupSelector
          width={`${8 + Math.max(...props.icons.map((icon) => icon.desc.length))}ch`}
          placeholder={'Select...'}
          choices={props.icons}
          preview={(icon) => <IconText preview={icon.preview} color={icon.color} desc={icon.desc} />}
          search={['preview', 'desc']}
          onSelect={props.onChange}
          popupState={popupState}
          setPopupState={setPopupState}
          closePopup={closePopup}
        />
      )}
    </div>
  )
}
