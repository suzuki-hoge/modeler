'use client'

import React from 'react'
import { MdAddCircleOutline } from 'react-icons/md'

import styles from './add-icon.module.scss'

interface Props {
  onClick: () => void
}

export const AddIcon = (props: Props) => {
  return <MdAddCircleOutline className={styles.component} onClick={props.onClick} />
}
