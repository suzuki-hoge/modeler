import { getStraightPath } from '@xyflow/react'

export type Line = { s: Point; d: Point }
export type Point = { x: number; y: number }

export function getInnerProps(
  sourceHandleX: number,
  sourceHandleY: number,
  sourceNodeX: number,
  sourceNodeY: number,
  sourceNodeW: number | undefined,
  sourceNodeH: number | undefined,
  targetHandleX: number,
  targetHandleY: number,
  targetNodeX: number,
  targetNodeY: number,
  targetNodeW: number | undefined,
  targetNodeH: number | undefined,
): { edgePath: string; palettePoint: Point; labelPoint: Point } | null {
  if (sourceNodeW == undefined || sourceNodeH == undefined || targetNodeW == undefined || targetNodeH == undefined)
    return null

  const edge = { s: { x: sourceHandleX, y: sourceHandleY - 4 }, d: { x: targetHandleX, y: targetHandleY - 4 } }

  // collision
  const sourceCollision = getSideEdges(sourceNodeX, sourceNodeY, sourceNodeW, sourceNodeH)
    .map((side) => findCollision(edge, side))
    .filter((c) => c)[0]
  const targetCollision = getSideEdges(targetNodeX, targetNodeY, targetNodeW, targetNodeH)
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

      const palettePoint = { x: labelX, y: labelY }
      const labelPoint = moveToVertical(shift(line.d, line.s, 12), line, 12)

      return { edgePath, palettePoint, labelPoint }
    }
  }
  return null
}

export function getSideEdges(x: number, y: number, w: number, h: number): Line[] {
  const lt = { x: x, y: y }
  const lb = { x: x, y: y + h }
  const rt = { x: x + w, y: y }
  const rb = { x: x + w, y: y + h }

  return [
    { s: lt, d: lb },
    { s: lt, d: rt },
    { s: rt, d: rb },
    { s: lb, d: rb },
  ]
}

export function findCollision(edge: Line, side: Line): Point | null {
  const dex = edge.d.x - edge.s.x
  const dey = edge.d.y - edge.s.y
  const dsx = side.d.x - side.s.x
  const dsy = side.d.y - side.s.y

  const s = (-dey * (edge.s.x - side.s.x) + dex * (edge.s.y - side.s.y)) / (-dsx * dey + dex * dsy)
  const t = (dsx * (edge.s.y - side.s.y) - dsy * (edge.s.x - side.s.x)) / (-dsx * dey + dex * dsy)

  return s >= 0 && s <= 1 && t >= 0 && t <= 1 ? { x: edge.s.x + t * dex, y: edge.s.y + t * dey } : null
}

export function shorten(line: Line, pixel: number): Line | null {
  const dx = line.d.x - line.s.x
  const dy = line.d.y - line.s.y
  const len = Math.sqrt(dx * dx + dy * dy)
  const dirX = dx / len
  const dirY = dy / len

  const newLine = {
    s: { x: line.s.x + dirX * pixel, y: line.s.y + dirY * pixel },
    d: { x: line.d.x - dirX * pixel, y: line.d.y - dirY * pixel },
  }

  const dx2 = newLine.d.x - newLine.s.x
  const dy2 = newLine.d.y - newLine.s.y
  const newLen = Math.sqrt(dx2 * dx2 + dy2 * dy2)

  return pixel < newLen && isSameVector(line, newLine) ? newLine : null
}

export function isSameVector(l1: Line, l2: Line): boolean {
  return l1.s.x < l1.d.x === l2.s.x < l2.d.x && l1.s.y < l1.d.y === l2.s.y < l2.d.y
}

export function shift(p1: Point, p2: Point, pixel: number): Point {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const angle = Math.atan2(dy, dx)

  return { x: p1.x + pixel * Math.cos(angle), y: p1.y + pixel * Math.sin(angle) }
}

export function moveToVertical(p: Point, l: Line, pixel: number): Point {
  const dx = l.d.x - l.s.x
  const dy = l.d.y - l.s.y
  const slope = dy / dx

  const perpSlope = -1 / slope

  if (slope === Infinity || slope === -Infinity) {
    return { x: p.x + pixel, y: p.y }
  }

  if (slope === 0) {
    return { x: p.x, y: p.y + pixel }
  }

  const angle = Math.atan(perpSlope)
  const dx2 = pixel * Math.cos(angle)
  const dy2 = pixel * Math.sin(angle)

  return { x: p.x + dx2, y: p.y + dy2 }
}
