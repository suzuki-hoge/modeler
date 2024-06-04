import { BaseEdge, ConnectionLineComponentProps, getStraightPath } from 'reactflow'
import { internalsSymbol, useNodes } from 'reactflow'

import { NodeData } from '@/app/_store/node/type'

export const ConnectionLine = ({ fromNode, toX, toY }: ConnectionLineComponentProps) => {
  const handles = useNodes<NodeData>()
    .filter((node) => node.selected || fromNode?.id === node.id)
    .map((node) => ({
      node,
      handle: node[internalsSymbol]!.handleBounds!.source!.filter((handle) => handle.id === 'center')[0],
    }))

  return handles.map(({ node, handle }) => {
    const fromHandleX = handle.x + handle.width / 2
    const fromHandleY = handle.y + handle.height / 2
    const sourceX = node.positionAbsolute!.x + fromHandleX
    const sourceY = node.positionAbsolute!.y + fromHandleY
    const [edgePath] = getStraightPath({ sourceX, sourceY, targetX: toX, targetY: toY })

    return <BaseEdge key={`${node.id}-${handle.id}`} path={edgePath} />
  })
}
