'use client'

import React from 'react'
import { PiArrowDownRightDuotone } from 'react-icons/pi'

interface Props {
  className?: string
  vector: 'right' | 'down' | 'left' | 'up'
  onClick?: () => void
}
const deg = { right: -45, down: 45, left: 135, up: -135 }

export const GeneralizationArrowIcon = (props: Props) => {
  return (
    <PiArrowDownRightDuotone
      className={props.className}
      style={{ transform: `rotate(${deg[props.vector]}deg)` }}
      onClick={props.onClick}
    />
  )
}
