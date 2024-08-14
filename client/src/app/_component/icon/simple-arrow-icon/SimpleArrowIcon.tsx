'use client'

import React from 'react'

import { Symbol } from '@/app/_component/icon/symbol/Symbol'

interface Props {
  className?: string
  vector: 'right' | 'down' | 'left' | 'up'
  size?: 'small' | 'normal' | 'large'
  border?: boolean
  onClick?: () => void
}

const deg = { right: 0, down: 90, left: 180, up: -90 }

export const SimpleArrowIcon = (props: Props) => {
  return (
    <Symbol
      name={'arrow_right_alt'}
      className={props.className}
      size={props.size}
      border={props.border}
      deg={deg[props.vector]}
      onClick={props.onClick}
    />
  )
}
