'use client'
import { XYPosition } from '@xyflow/react'
import React, { ChangeEvent, Dispatch, RefObject, SetStateAction, useEffect, useRef, useState } from 'react'
import { shallow } from 'zustand/shallow'

import { ClassSelectorInText } from '@/app/_component/input/class-selector/ClassSelectorInText'
import {
  changedByInput,
  changedBySelect,
  findRefPositions,
  innerToParts,
  innerToRef,
  RefString,
} from '@/app/_component/input/completable-input/RefString'
import { Popup, PopupState, usePopup } from '@/app/_component/selector/Popup'
import { NodeHeader } from '@/app/_object/node/type'
import { useProjectStore } from '@/app/_store/project-store'

import styles from './completable-input.module.scss'

interface Cursor {
  s: number
  e: number
  d?: 'forward' | 'backward' | 'none'
}

interface Props {
  inner: string
  onTextChange: (inner: string) => void
  sourceNodeId: string
  newNodePositionBase: XYPosition & { distance: number }
}

export const CompletableInput = (props: Props) => {
  // store
  const headers = useProjectStore((state) => state.nodeHeaders, shallow)

  // state

  const [cursor, setCursor] = useState<Cursor>({ s: 0, e: 0, d: 'none' })
  const [refString, setRefString] = useState(innerToRef(props.inner, headers))
  const [isEditing, setIsEditing] = useState(false)
  const [selectorTopNodeId, setSelectorTopNodeId] = useState('')
  const { popupState, openPopup, closePopup } = usePopup()

  useEffect(() => {
    if (isEditing) inputRef.current?.focus()
  }, [isEditing])

  // cursor position
  const inputRef = useRef<HTMLInputElement>(null)

  const x = `${inputRef.current?.offsetLeft || 0}px + ${Math.max(0, cursor.s - 4)}ch`
  const y = (inputRef.current?.offsetTop || 0) + (inputRef.current?.offsetHeight || 0) + 'px'

  useEffect(() => {
    inputRef.current?.setSelectionRange(cursor.s, cursor.e, cursor.d)
  }, [cursor])

  return (
    <div className={styles.component}>
      {isEditing && (
        <>
          <Input
            headers={headers}
            refString={refString}
            setRefString={setRefString}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            setSelectorTopNodeId={setSelectorTopNodeId}
            setCursor={setCursor}
            onChange={props.onTextChange}
            popupState={popupState}
            openPopup={openPopup}
            closePopup={closePopup}
            inputRef={inputRef}
          />
          <Popup popupState={popupState} closePopup={closePopup} focusBackRef={inputRef}>
            <ClassSelectorInText
              x={x}
              y={y}
              defaultId={selectorTopNodeId}
              sourceNodeId={props.sourceNodeId}
              newNodePositionBase={props.newNodePositionBase}
              onPostCreate={(node) => {
                setRefString((prev) => {
                  const [nextRefString, nextCursor] = changedBySelect(prev, headers, node.id, node.data.name, cursor.s)
                  setCursor({ s: nextCursor, e: nextCursor, d: 'none' })
                  return nextRefString
                })
                props.onTextChange(refString.inner)
              }}
              onPostSelect={(header) => {
                setRefString((prev) => {
                  const [nextRefString, nextCursor] = changedBySelect(prev, headers, header.id, header.name, cursor.s)
                  setCursor({ s: nextCursor, e: nextCursor, d: 'none' })
                  return nextRefString
                })
                props.onTextChange(refString.inner)
              }}
              onClose={() => setIsEditing(false)}
            />
          </Popup>
        </>
      )}
      {!isEditing && <Preview headers={headers} refString={refString} onClick={() => setIsEditing(true)} />}
    </div>
  )
}

interface InputProps {
  headers: NodeHeader[]
  refString: RefString
  setRefString: Dispatch<SetStateAction<RefString>>
  isEditing: boolean
  setIsEditing: Dispatch<SetStateAction<boolean>>
  setSelectorTopNodeId: Dispatch<SetStateAction<string>>
  setCursor: Dispatch<SetStateAction<Cursor>>
  onChange: (inner: string) => void
  popupState: PopupState
  openPopup: () => void
  closePopup: () => void
  inputRef: RefObject<HTMLInputElement> | null
}

const Input = (props: InputProps) => {
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
        const s = e.target.selectionStart!
        props.setCursor({ s, e: e.target.selectionEnd || s, d: e.target.selectionDirection || undefined })

        const refPositions = findRefPositions(props.refString.inner, props.headers)
        const ref = refPositions.find(({ frontS, frontE }) => frontS < s && s <= frontE)

        if (ref) {
          props.setSelectorTopNodeId(ref.header.id)
          props.openPopup()
        } else {
          props.setSelectorTopNodeId('')
          props.closePopup()
        }
      }}
      onBlur={() => {
        if (!props.popupState.isEditing) {
          props.onChange(props.refString.inner)
          props.setIsEditing(false)
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
