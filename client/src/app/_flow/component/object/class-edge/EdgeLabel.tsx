import { EdgeLabelRenderer } from '@xyflow/react'
import { memo } from 'react'

interface Props {
  x: number
  y: number
  value: string
}

export const EdgeLabel = memo(function _EdgeLabel(props: Props) {
  return (
    <EdgeLabelRenderer>
      <div
        style={{
          position: 'absolute',
          transform: `translate(-50%, -50%) translate(${props.x}px,${props.y}px)`,
          fontSize: 12,
          pointerEvents: 'all',
        }}
        className='nodrag nopan'
      >
        {props.value !== '1' && <span>{props.value}</span>}
      </div>
    </EdgeLabelRenderer>
  )
})
