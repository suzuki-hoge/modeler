'use client'

import React from 'react'

import styles from './char-icon.module.scss'

interface Props {
  char: string
  color?: string
  onClick?: () => void
}

export const CharIcon = (props: Props) => {
  return (
    <span
      className={styles.component}
      style={props.color ? { backgroundColor: props.color } : { backgroundColor: 'transparent' }}
      onClick={props.onClick}
    >
      {props.char}
    </span>
  )
}
