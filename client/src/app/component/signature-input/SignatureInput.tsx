'use client'

import React, { useState } from 'react'

import styles from './signature-input.module.scss'

interface Props {}

export const SignatureInput = (props: Props) => {
  const signature = 'fun #name(#rep([#var: #Type],)): #Type'
  const [name, setName] = useState('')

  return (
    <div className={styles.component}>
      <span>fun </span>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={'name'} />
      <span>(</span>
    </div>
  )
}
