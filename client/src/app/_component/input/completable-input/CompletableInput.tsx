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
import { NodeHeader2 } from '@/app/_store/node/type'

import styles from './completable-input.module.scss'

interface BaseProps {
  inner: string
}

type Props = (BaseProps & { readonly: false; onChange: (inner: string) => void }) | (BaseProps & { readonly: true })

export const CompletableInput = (props: Props) => {
  const headers: NodeHeader2[] = [
    { id: '123', icon: { preview: 'C', desc: 'Class', color: 'lightgreen' }, name: 'Foo' },
    { id: '456', icon: { preview: 'C', desc: 'Class', color: 'lightgreen' }, name: 'Bar' },
  ]

  const [cursor, setCursor] = useState(0)
  const [refString, setRefString] = useState(innerToRef(props.inner, headers))
  const [isEditing, setIsEditing] = useState(false)
  const { popupState, setPopupState, openPopup, closePopup } = usePopup()

  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) ref.current?.focus()
  }, [isEditing])

  return (
    <div className={styles.component}>
      {isEditing && !props.readonly && (
        <>
          <Input
            headers={headers}
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
            width={`${4 + Math.max(...headers.map((header) => header.name.length))}rem`}
            choices={headers}
            preview={(header) => <IconText icon={header.icon.preview} color={header.icon.color} desc={header.name} />}
            search={['name']}
            onSelect={(header) => {
              setRefString((prev) => changedBySelect(prev, headers, header.id, header.name, cursor))
            }}
            popupState={popupState}
            setPopupState={setPopupState}
            closePopup={closePopup}
            focusBackRef={ref}
          />
        </>
      )}
      {!isEditing && (
        <Preview headers={headers} inner={refString.inner} onClick={() => setIsEditing(!props.readonly)} />
      )}
    </div>
  )
}

interface InputProps {
  headers: NodeHeader2[]
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
  headers: NodeHeader2[]
  inner: string
  onClick: () => void
}

const Preview = (props: PreviewProps) => {
  return (
    <div className={styles.preview}>
      {innerToParts(props.inner, props.headers).map(({ value, ref }, i) =>
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
  )
}
