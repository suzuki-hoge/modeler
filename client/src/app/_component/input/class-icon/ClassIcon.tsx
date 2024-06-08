'use client'
import React from 'react'

import { CharIcon } from '@/app/_component/icon/char-icon/CharIcon'
import { IconText } from '@/app/_component/icon/icon-text/IconText'
import { PopupSelector } from '@/app/_component/selector-base/popup-selector/PopupSelector'
import { usePopup } from '@/app/_hook/popup'
import { NodeIcon2 } from '@/app/_store/node/type'

import styles from './class-icon.module.scss'

interface BaseProps {
  icon: NodeIcon2
  icons: NodeIcon2[]
}

type Props = (BaseProps & { readonly: false; onChange: (icon: NodeIcon2) => void }) | (BaseProps & { readonly: true })

export const ClassIcon = (props: Props) => {
  const { popupState, setPopupState, openPopup, closePopup } = usePopup()

  return (
    <div className={styles.component}>
      <CharIcon char={props.icon.preview} color={props.icon.color} onClick={openPopup} />
      {!props.readonly && (
        <PopupSelector
          width={`${4 + Math.max(...props.icons.map((icon) => icon.desc.length))}rem`}
          choices={props.icons}
          preview={(icon) => <IconText icon={icon.preview} color={icon.color} desc={icon.desc} />}
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
