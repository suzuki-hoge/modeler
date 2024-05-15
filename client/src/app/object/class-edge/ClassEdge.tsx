import { BaseEdge, EdgeProps, getStraightPath } from 'reactflow'
import { shallow } from 'zustand/shallow'

import { getSideEdges, findCollision, shorten } from '@/app/object/class-edge/line'
import { selector, useStore } from '@/app/object/store'

export const ClassEdge = (props: EdgeProps) => {
  const { source, sourceX, sourceY, target, targetX, targetY } = props

  const { nodes } = useStore(selector, shallow)
  const sourceNode = nodes.find((node) => node.id === source)!
  const targetNode = nodes.find((node) => node.id === target)!

  // center to center
  const edge = {
    s: { x: sourceX, y: sourceY - sourceNode.height! / 2 - 3 },
    d: { x: targetX, y: targetY - targetNode.height! / 2 - 3 },
  }

  // collision
  const sourceCollision = getSideEdges(sourceNode)
    .map((side) => findCollision(edge, side))
    .filter((c) => c)[0]
  const targetCollision = getSideEdges(targetNode)
    .map((side) => findCollision(edge, side))
    .filter((c) => c)[0]

  if (sourceCollision && targetCollision) {
    const line = shorten({ s: sourceCollision, d: targetCollision }, 8)

    const [edgePath] = getStraightPath({
      sourceX: line.s.x,
      sourceY: line.s.y,
      targetX: line.d.x,
      targetY: line.d.y,
    })

    return <BaseEdge path={edgePath} {...props} />
  } else {
    return <></>
  }
}
