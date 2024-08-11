import { BaseEdge, ConnectionLineComponent, ConnectionLineComponentProps, getStraightPath } from '@xyflow/react'

export const ConnectionLine: ConnectionLineComponent = ({ fromNode, toX, toY }: ConnectionLineComponentProps) => {
  const centerHandle = fromNode.internals.handleBounds?.source?.find((handle) => handle.id === 'center')

  if (centerHandle) {
    const sourceX = fromNode.position.x + centerHandle.x + centerHandle.width / 2
    const sourceY = fromNode.position.y + centerHandle.y + centerHandle.height / 2
    const [edgePath] = getStraightPath({ sourceX, sourceY, targetX: toX, targetY: toY })

    return <BaseEdge key={`${fromNode.id}-${centerHandle.id}`} path={edgePath} />
  } else {
    return <></>
  }
}
