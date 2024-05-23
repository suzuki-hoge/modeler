import { BaseEdge, EdgeProps, getStraightPath } from 'reactflow'
import { shallow } from 'zustand/shallow'

import { EdgeLabel } from '@/app/component/class-edge/EdgeLabel'
import { EdgePalette } from '@/app/component/class-edge/EdgePalette'
import { getSideEdges, findCollision, shorten, shift, moveToVertical } from '@/app/component/class-edge/line'
import { EdgeData } from '@/app/object/edge/type'
import { selector, useStore } from '@/app/object/store'

export const ClassEdge = (props: EdgeProps<EdgeData>) => {
  const { id, source, sourceX, sourceY, target, targetX, targetY, selected, data } = props

  const store = useStore(selector, shallow)
  const sourceNode = store.getNode(source)
  const targetNode = store.getNode(target)

  if (!sourceNode || !targetNode) return <></>

  const edge = { s: { x: sourceX, y: sourceY - 4 }, d: { x: targetX, y: targetY - 4 } }

  // collision
  const sourceCollision = getSideEdges(sourceNode)
    .map((side) => findCollision(edge, side))
    .filter((c) => c)[0]
  const targetCollision = getSideEdges(targetNode)
    .map((side) => findCollision(edge, side))
    .filter((c) => c)[0]

  if (sourceCollision && targetCollision) {
    const line = shorten({ s: sourceCollision, d: targetCollision }, 4)

    if (line) {
      const [edgePath, labelX, labelY] = getStraightPath({
        sourceX: line.s.x,
        sourceY: line.s.y,
        targetX: line.d.x,
        targetY: line.d.y,
      })

      const palettePos = { x: labelX, y: labelY }
      const labelPos = moveToVertical(shift(line.d, line.s, 12), line, 12)

      return (
        <>
          <BaseEdge path={edgePath} {...props} />
          {selected && <EdgePalette id={id} data={data!} pos={palettePos} />}
          <EdgeLabel pos={labelPos} value={data!.label} />
        </>
      )
    }
  }
  return <></>
}
