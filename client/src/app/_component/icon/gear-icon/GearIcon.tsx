'use client'

import React from 'react'

import { Symbol } from '@/app/_component/icon/symbol/Symbol'

interface Props {
  size?: 'small' | 'normal' | 'large'
  onClick: () => void
}

export const GearIcon = (props: Props) => {
  return <Symbol name={'settings'} size={props.size} onClick={props.onClick} />
}
