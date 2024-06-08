'use client'

import React from 'react'
import { PiArrowDownRightLight } from 'react-icons/pi'

import styles from './simple-arrow-icon.module.scss'

interface Props {
  vector: 'right' | 'down' | 'left' | 'up'
  onClick: () => void
}
const deg = { right: -45, down: 45, left: 135, up: -135 }

export const SimpleArrowIcon = (props: Props) => {
  return (
    <PiArrowDownRightLight
      className={styles.component}
      style={{ transform: `rotate(${deg[props.vector]}deg)` }}
      onClick={props.onClick}
    />
  )
}
