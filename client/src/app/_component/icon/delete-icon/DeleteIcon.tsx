'use client'

import React from 'react'
import { AiOutlineDelete } from 'react-icons/ai'

import styles from './delete-icon.module.scss'

interface Props {
  onClick: () => void
}

export const DeleteIcon = (props: Props) => {
  return <AiOutlineDelete className={styles.component} onClick={props.onClick} />
}
