'use client'
import React, { useRef } from 'react'

import { CharIcon } from '@/app/_component/icon/char-icon/CharIcon'
import { IconText } from '@/app/_component/icon/icon-text/IconText'
import { Popup, usePopup } from '@/app/_component/selector/Popup'
import { Selector } from '@/app/_component/selector/Selector'
import { getIcon } from '@/app/_flow/object/node/function'
import { NodeIcon } from '@/app/_flow/object/node/type'

import styles from './class-icon.module.scss'

interface Props {
  iconId: string
  icons: NodeIcon[]
  readonly: boolean
  onChange: (icon: NodeIcon) => void
}

export const ClassIcon = (props: Props) => {
  const { popupState, openPopup, closePopup } = usePopup()

  const icon = getIcon(props.iconId, props.icons)

  const iconRef = useRef<HTMLSpanElement>(null)

  const x = (iconRef.current?.offsetLeft || 0) + 'px'
  const y = (iconRef.current?.offsetTop || 0) + (iconRef.current?.offsetHeight || 0) + 'px'

  return (
    <div className={styles.component}>
      <CharIcon char={icon.preview} color={icon.color} variant={'medium'} onClick={openPopup} spanRef={iconRef} />
      {!props.readonly && (
        <Popup popupState={popupState} closePopup={closePopup}>
          <Selector
            x={x}
            y={y}
            width={`${12 + Math.max(...props.icons.map((icon) => icon.desc.length))}ch`}
            placeholder={'icon...'}
            empty={'no icons'}
            choices={props.icons}
            defaultId={icon.id}
            preview={(icon) => <IconText preview={icon.preview} color={icon.color} desc={icon.desc} />}
            searchKeys={['preview', 'desc']}
            uniqueKey={'id'}
            sortKey={'preview'}
            onSelect={props.onChange}
          />
        </Popup>
      )}
    </div>
  )
}
