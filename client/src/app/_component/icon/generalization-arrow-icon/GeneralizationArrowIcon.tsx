'use client'

import React from 'react'
import { PiArrowDownRightDuotone } from 'react-icons/pi'

import styles from './generalization-arrow-icon.module.scss'

interface Props {
  vector: 'right' | 'down' | 'left' | 'up'
  onClick: () => void
}
const deg = { right: -45, down: 45, left: 135, up: -135 }

export const GeneralizationArrowIcon = (props: Props) => {
  return (
    <PiArrowDownRightDuotone
      className={styles.component}
      style={{ transform: `rotate(${deg[props.vector]}deg)` }}
      onClick={props.onClick}
    />
  )
}
