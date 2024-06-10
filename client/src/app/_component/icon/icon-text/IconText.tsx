'use client'

import React from 'react'

import { CharIcon } from '@/app/_component/icon/char-icon/CharIcon'

import styles from './icon-text.module.scss'

interface Props {
  preview: string
  color: string
  desc: string
}

export const IconText = (props: Props) => {
  return (
    <div className={styles.component}>
      <CharIcon char={props.preview} color={props.color} />
      <span>{props.desc}</span>
    </div>
  )
}
