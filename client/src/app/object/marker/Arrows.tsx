import React from 'react'

export default function Arrows() {
  return (
    <svg style={{ position: 'absolute', top: 0, left: 0 }}>
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
