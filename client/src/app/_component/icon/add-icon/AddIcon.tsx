'use client'

import React from 'react'

import { Symbol } from '@/app/_component/icon/symbol/Symbol'

interface Props {
  onClick: () => void
}

export const AddIcon = (props: Props) => {
  return <Symbol name={'add_circle'} onClick={props.onClick} />
}
