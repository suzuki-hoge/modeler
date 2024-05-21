import { CSSProperties } from 'react'
import { ConnectionLineType, DefaultEdgeOptions, EdgeTypes } from 'reactflow'

import { ClassEdge } from '@/app/component/class-edge/ClassEdge'

export const edgeTypes: EdgeTypes = { class: ClassEdge }

export const connectionLineStyle: CSSProperties = { stroke: 'gray', strokeWidth: 1 }

export const defaultEdgeOptions: DefaultEdgeOptions = {
  style: connectionLineStyle,
  type: 'class',
}

export const connectionLineType = ConnectionLineType.Straight
