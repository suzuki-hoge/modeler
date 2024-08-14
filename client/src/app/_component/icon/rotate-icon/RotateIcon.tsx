'use client'

import React from 'react'

import { Symbol } from '@/app/_component/icon/symbol/Symbol'

interface Props {
  onClick: () => void
}

export const RotateIcon = (props: Props) => {
  return <Symbol name={'sync'} onClick={props.onClick} />
}
