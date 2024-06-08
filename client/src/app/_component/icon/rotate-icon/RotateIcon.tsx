'use client'

import React from 'react'
import { FaArrowsRotate } from 'react-icons/fa6'

import styles from './rotate-icon.module.scss'

interface Props {
  onClick: () => void
}

export const RotateIcon = (props: Props) => {
  return <FaArrowsRotate className={styles.component} onClick={props.onClick} />
}
