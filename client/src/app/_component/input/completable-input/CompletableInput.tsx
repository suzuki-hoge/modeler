'use client'
import React, { ChangeEvent, Dispatch, RefObject, SetStateAction, useEffect, useRef, useState } from 'react'

import { IconText } from '@/app/_component/icon/icon-text/IconText'
import {
  changedByInput,
  changedBySelect,
  findRefPositions,
  innerToParts,
  innerToRef,
  RefString,
} from '@/app/_component/input/completable-input/RefString'
import { PopupSelector } from '@/app/_component/selector-base/popup-selector/PopupSelector'
import { usePopup } from '@/app/_hook/popup'
import { getIcon } from '@/app/_object/node/function'
import { NodeHeader, NodeIcon } from '@/app/_object/node/type'

import styles from './completable-input.module.scss'

interface Props {
  inner: string
  headers: NodeHeader[]
  icons: NodeIcon[]
  readonly: boolean
  onChange: (inner: string) => void
}

export const CompletableInput = (props: Props) => {
  const [cursor, setCursor] = useState(0)
  const [refString, setRefString] = useState(innerToRef(props.inner, props.headers))
  const [isEditing, setIsEditing] = useState(false)
  const { popupState, setPopupState, openPopup, closePopup } = usePopup()

  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => setRefString(innerToRef(props.inner, props.headers)), [props.inner, props.headers])

  useEffect(() => {
    if (isEditing) ref.current?.focus()
  }, [isEditing])

  return (
    <div className={styles.component}>
      {isEditing && !props.readonly && (
        <>
          <Input
            headers={props.headers}
            refString={refString}
            setRefString={setRefString}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            cursor={cursor}
            setCursor={setCursor}
            onChange={props.onChange}
            openPopup={openPopup}
            closePopup={closePopup}
            inputRef={ref}
          />
          <PopupSelector
            width={`${4 + Math.max(...props.headers.map((header) => header.name.length))}rem`}
            placeholder={'Select...'}
            choices={props.headers}
            preview={(header) => {
              const icon = getIcon(header.iconId, props.icons)
              return <IconText preview={icon.preview} color={icon.color} desc={header.name} />
            }}
            search={['name']}
            onSelect={(header) => {
              setRefString((prev) => changedBySelect(prev, props.headers, header.id, header.name, cursor))
            }}
            popupState={popupState}
            setPopupState={setPopupState}
            closePopup={closePopup}
            focusBackRef={ref}
          />
        </>
      )}
      {!isEditing && (
        <Preview headers={props.headers} refString={refString} onClick={() => setIsEditing(!props.readonly)} />
      )}
    </div>
  )
}

interface InputProps {
  headers: NodeHeader[]
  refString: RefString
  setRefString: Dispatch<SetStateAction<RefString>>
  isEditing: boolean
  setIsEditing: Dispatch<SetStateAction<boolean>>
  cursor: number
  setCursor: Dispatch<SetStateAction<number>>
  onChange: (inner: string) => void
  openPopup: () => void
  closePopup: () => void
  inputRef: RefObject<HTMLInputElement> | null
}

const Input = (props: InputProps) => {
  const refPositions = findRefPositions(props.refString.inner, props.headers)

  return (
    <input
      className={styles.input}
      value={props.refString.front}
      style={{ width: `${props.refString.front.length + 1}ch` }}
      onChange={(e) => {
        props.setRefString((prev) => changedByInput(prev, e.target.value, props.headers))
      }}
      onKeyDown={(e) => {
        if (e.code === 'Space' && e.ctrlKey) {
          props.openPopup()
          e.preventDefault()
        }
        if (e.code === 'Enter') {
          props.onChange(props.refString.inner)
          props.setIsEditing(false)
        }
      }}
      onSelect={(e: ChangeEvent<HTMLInputElement>) => {
        const i = e.target.selectionStart!
        props.setCursor(i)
        const isInFrontRef = refPositions.findIndex(({ frontS, frontE }) => frontS < i && i <= frontE) !== -1
        if (isInFrontRef) {
          props.openPopup()
        } else {
          props.closePopup()
        }
      }}
      ref={props.inputRef}
    />
  )
}

interface PreviewProps {
  headers: NodeHeader[]
  refString: RefString
  onClick: () => void
}

const Preview = (props: PreviewProps) => {
  return props.refString.inner.length !== 0 ? (
    <div className={styles.preview} style={{ width: `${props.refString.front.length + 1}ch` }}>
      {innerToParts(props.refString.inner, props.headers).map(({ value, ref }, i) =>
        ref ? (
          <span key={i} className={styles.ref}>
            {value}
          </span>
        ) : (
          <span key={i} className={styles.text} onClick={props.onClick}>
            {value}
          </span>
        ),
      )}
    </div>
  ) : (
    <div className={styles.preview} style={{ width: '100%' }} onClick={props.onClick}>
      <span>&nbsp;</span>
    </div>
  )
}
