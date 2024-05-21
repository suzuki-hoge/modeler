import { Node } from 'reactflow'

import { findCollision, getSideEdges, isSameVector, Line, Point } from '@/app/component/class-edge/line'
import { NodeData } from '@/app/object/node/type'

test('getSideEdges', () => {
  const node: Pick<Node<NodeData>, 'position' | 'height' | 'width'> = { position: { x: 0, y: 0 }, height: 8, width: 8 }

  const exp: Line[] = [
    { s: { x: 0, y: 0 }, d: { x: 0, y: 8 } },
    { s: { x: 0, y: 0 }, d: { x: 8, y: 0 } },
    { s: { x: 8, y: 0 }, d: { x: 8, y: 8 } },
    { s: { x: 0, y: 8 }, d: { x: 8, y: 8 } },
  ]
  const act = getSideEdges(node)

  expect(act).toEqual(exp)
})

test('findCollision', () => {
  const edge: Line = { s: { x: 4, y: 4 }, d: { x: 4, y: 8 } }
  const side: Line = { s: { x: 2, y: 6 }, d: { x: 6, y: 6 } }

  const exp: Point = { x: 4, y: 6 }
  const act = findCollision(edge, side)

  expect(act).toEqual(exp)
})

test('findCollision', () => {
  const edge: Line = { s: { x: 82.59, y: 58.56 }, d: { x: 288.29, y: 314.31 } }
  const s1: Line = { s: { x: 304.95, y: 226.34 }, d: { x: 304.95, y: 342.34 } }
  const s2: Line = { s: { x: 304.95, y: 226.34 }, d: { x: 501.95, y: 226.34 } }
  const s3: Line = { s: { x: 501.95, y: 226.34 }, d: { x: 501.95, y: 342.34 } }
  const s4: Line = { s: { x: 304.95, y: 342.34 }, d: { x: 501.95, y: 342.34 } }

  const a1 = findCollision(edge, s1)
  const a2 = findCollision(edge, s2)
  const a3 = findCollision(edge, s3)
  const a4 = findCollision(edge, s4)

  expect(a1).toBe(null)
  expect(a2).toBe(null)
  expect(a3).toBe(null)
  expect(a4).toBe(null)
})

test('isSameVector', () => {
  const a1 = isSameVector({ s: { x: 4, y: 4 }, d: { x: 6, y: 6 } }, { s: { x: 3, y: 3 }, d: { x: 5, y: 5 } })
  const a2 = isSameVector({ s: { x: 4, y: 4 }, d: { x: 6, y: 6 } }, { s: { x: 3, y: 3 }, d: { x: 3, y: 5 } })
  const a3 = isSameVector({ s: { x: 4, y: 4 }, d: { x: 6, y: 6 } }, { s: { x: 3, y: 3 }, d: { x: 5, y: 3 } })

  expect(a1).toBe(true)
  expect(a2).toBe(false)
  expect(a3).toBe(false)
})
