import React, { CSSProperties } from 'react'

interface Props {
  name: string
  className?: string
  style?: CSSProperties
  size?: 'small' | 'normal' | 'large'
  border?: boolean
  deg?: number
  onClick?: () => void
}

export const Symbol = (props: Props) => {
  const [border, size] = variant(props.size)
  return (
    <span
      className={`material-symbols-outlined ${props.className} symbol`}
      style={{
        ...props.style,
        ...{ display: 'inline-block', transform: `rotate(${props.deg}deg)`, cursor: 'pointer' },
        ...{ height: `${size}rem`, width: `${size}rem`, fontSize: `${size}rem` },
        ...(props.border ? { border: `solid ${border}px black`, borderRadius: '50%' } : {}),
      }}
      onClick={props.onClick}
    >
      {props.name}
    </span>
  )
}

function variant(size?: 'small' | 'normal' | 'large'): [number, number] {
  if (size === 'small') return [1, 0.75]
  else if (size === 'large') return [2, 1.25]
  else return [1, 1]
}
