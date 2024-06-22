'use client'
import React, { ChangeEvent, Dispatch, RefObject, SetStateAction, useEffect, useRef, useState } from 'react'
import { Node } from 'reactflow'

import { ClassCreatableSelector } from '@/app/_component/input/class-creatable-selector/ClassCreatableSelector'
import {
  changedByInput,
  changedBySelect,
  findRefPositions,
  innerToParts,
  innerToRef,
  RefString,
} from '@/app/_component/input/completable-input/RefString'
import { Popup, usePopup } from '@/app/_component/selector/Popup'
import { NodeData, NodeHeader, NodeIcon } from '@/app/_object/node/type'

import styles from './completable-input.module.scss'

interface Cursor {
  s: number
  e: number
  d?: 'forward' | 'backward' | 'none'
}

interface Props {
  inner: string
  headers: NodeHeader[]
  icons: NodeIcon[]
  readonly: boolean
  onTextChange: (inner: string) => void
  onPostNodeCreate: (node: Node<NodeData>) => void
  onPostNodeSelect: (header: NodeHeader) => void
}

export const CompletableInput = (props: Props) => {
  const [cursor, setCursor] = useState<Cursor>({ s: 0, e: 0, d: 'none' })
  const [refString, setRefString] = useState(innerToRef(props.inner, props.headers))
  const [isEditing, setIsEditing] = useState(false)
  const [popupNodeId, setPopupNodeId] = useState<string | undefined>(undefined)
  const { popupState, openPopup, closePopup } = usePopup()

  const inputRef = useRef<HTMLInputElement>(null)

  const x = `${inputRef.current?.offsetLeft || 0}px + ${Math.max(0, cursor.s - 4)}ch`
  const y = (inputRef.current?.offsetTop || 0) + (inputRef.current?.offsetHeight || 0) + 'px'

  useEffect(() => setRefString(innerToRef(props.inner, props.headers)), [props.inner, props.headers])

  useEffect(() => {
    if (isEditing) inputRef.current?.focus()
  }, [isEditing])

  useEffect(() => {
    inputRef.current?.setSelectionRange(cursor.s, cursor.e, cursor.d)
  }, [cursor])

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
            setPopupNodeId={setPopupNodeId}
            setCursor={setCursor}
            onChange={props.onTextChange}
            openPopup={openPopup}
            closePopup={closePopup}
            inputRef={inputRef}
          />
          <Popup popupState={popupState} closePopup={closePopup} focusBackRef={inputRef}>
            <ClassCreatableSelector
              x={x}
              y={y}
              headers={props.headers}
              defaultId={popupNodeId}
              icons={props.icons}
              newNodePos={{ x: 0, y: 0 }}
              onSelect={(header) => {
                setRefString((prev) => {
                  const [nextRefString, nextCursor] = changedBySelect(
                    prev,
                    props.headers,
                    header.id,
                    header.name,
                    cursor.s,
                  )
                  setCursor({ s: nextCursor, e: nextCursor, d: 'none' })
                  return nextRefString
                })
                props.onPostNodeSelect(header)
              }}
              onPostNodeCreate={(node) => {
                setRefString((prev) => {
                  const [nextRefString, nextCursor] = changedBySelect(
                    prev,
                    props.headers,
                    node.id,
                    node.data.name,
                    cursor.s,
                  )
                  setCursor({ s: nextCursor, e: nextCursor, d: 'none' })
                  return nextRefString
                })
                props.onPostNodeCreate(node)
              }}
            />
          </Popup>
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
  setPopupNodeId: Dispatch<SetStateAction<string | undefined>>
  setCursor: Dispatch<SetStateAction<Cursor>>
  onChange: (inner: string) => void
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
          props.openPopup()
          props.setPopupNodeId(ref.header.id)
        } else {
          props.closePopup()
          props.setPopupNodeId(undefined)
        }
      }}
      onBlur={() => {
        props.onChange(props.refString.inner)
        props.setIsEditing(false)
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
