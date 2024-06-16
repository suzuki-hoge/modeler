'use client'

import React, { RefObject } from 'react'

import styles from './char-icon.module.scss'

interface Props {
  char: string
  color: string
  variant: 'small' | 'medium'
  spanRef?: RefObject<HTMLSpanElement> | null
  onClick?: () => void
}

export const CharIcon = (props: Props) => {
  return (
    <span
      className={`${styles.component} ${props.variant === 'small' ? styles.small : styles.medium}`}
      style={{ backgroundColor: props.color }}
      ref={props.spanRef}
      onClick={props.onClick}
    >
      {props.char}
    </span>
  )
}
