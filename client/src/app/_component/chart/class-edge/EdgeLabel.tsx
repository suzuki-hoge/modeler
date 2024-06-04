import { EdgeLabelRenderer } from 'reactflow'

import { Point } from '@/app/_component/chart/class-edge/line'

interface Props {
  pos: Point
  value: string
}

export const EdgeLabel = ({ pos, value }: Props) => {
  return (
    <EdgeLabelRenderer>
      <div
        style={{
          position: 'absolute',
          transform: `translate(-50%, -50%) translate(${pos.x}px,${pos.y}px)`,
          fontSize: 12,
          pointerEvents: 'all',
        }}
        className='nodrag nopan'
      >
        {value !== '1' && <span>{value}</span>}
      </div>
    </EdgeLabelRenderer>
  )
}
