'use client'

import React from 'react'

import { CharIcon } from '@/app/_component/icon/char-icon/CharIcon'

import styles from './icon-text.module.scss'

interface Props {
  icon: string
  color: string
  desc: string
}

export const IconText = (props: Props) => {
  return (
    <div className={styles.component}>
      <CharIcon char={props.icon} color={props.color} />
      <span>{props.desc}</span>
    </div>
  )
}
