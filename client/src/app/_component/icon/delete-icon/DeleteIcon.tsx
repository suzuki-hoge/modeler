'use client'

import React from 'react'

import { Symbol } from '@/app/_component/icon/symbol/Symbol'

interface Props {
  onClick: () => void
}

export const DeleteIcon = (props: Props) => {
  return <Symbol name={'delete_forever'} onClick={props.onClick} />
}
