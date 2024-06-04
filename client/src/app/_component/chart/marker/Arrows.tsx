import React from 'react'

export type ArrowType = 'v-arrow' | 'filled-arrow'

export default function Arrows() {
  return (
    <svg>
      <defs>
        <marker
          id='v-arrow'
          viewBox='0 0 10 10'
          refX='8'
          refY='5'
          markerUnits='strokeWidth'
          markerWidth='10'
          markerHeight='10'
          orient='auto'
        >
          <path d='M 0 0 L 8 5 z' fill='none' stroke='gray' />
          <path d='M 8 5 L 0 10 z' fill='none' stroke='gray' />
        </marker>
        <marker
          id='filled-arrow'
          viewBox='0 0 10 10'
          refX='8'
          refY='5'
          markerUnits='strokeWidth'
          markerWidth='10'
          markerHeight='10'
          orient='auto'
        >
          <path d='M 0 0 L 10 5 L 0 10 z' fill='white' stroke='gray' />
        </marker>
      </defs>
    </svg>
  )
}
