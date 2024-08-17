'use client'
import React, { useId } from 'react'

import styles from './switch.module.scss'

interface Props {
  checked: boolean
  onToggle: (checked: boolean) => void
}

export const Switch = (props: Props) => {
  const id = useId()

  return (
    <>
      <input
        id={id}
        type='checkbox'
        className={styles.input}
        checked={props.checked}
        onChange={() => props.onToggle(!props.checked)}
      />
      <label htmlFor={id} className={styles.content}></label>
    </>
  )
}
