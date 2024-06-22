'use client'
import React, { useEffect, useRef, useState } from 'react'

import styles from './class-name.module.scss'

interface Props {
  name: string
  readonly: boolean
  onChange: (name: string) => void
}

export const ClassName = (props: Props) => {
  const [isEditing, setIsEditing] = useState(false)
  const [tmp, setTmp] = useState(props.name)

  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) ref.current?.focus()
  }, [isEditing])

  return (
    <>
      {isEditing && !props.readonly && (
        <input
          className={styles.input}
          value={tmp}
          onChange={(e) => setTmp(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              props.onChange(tmp)
              setIsEditing(false)
            }
          }}
          onBlur={() => {
            props.onChange(tmp)
            setIsEditing(false)
          }}
          ref={ref}
        />
      )}
      {!isEditing && (
        <span className={styles.preview} onClick={() => setIsEditing(!props.readonly)}>
          {props.name}
        </span>
      )}
    </>
  )
}
