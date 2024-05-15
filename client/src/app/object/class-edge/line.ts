import { Node } from 'reactflow'

import { NodeData } from '@/app/object/node'

export type Line = { s: Point; d: Point }
export type Point = { x: number; y: number }

export function p(p: Point | null): string {
  return p ? `(${p.x.toFixed(2)}, ${p.y.toFixed(2)})` : ''
}
export function l(l: Line): string {
  return `${p(l.s)} -> ${p(l.d)}`
}

export function getSideEdges(node: Pick<Node<NodeData>, 'position' | 'height' | 'width'>): Line[] {
  const lt = { x: node.position.x, y: node.position.y }
  const lb = { x: node.position.x, y: node.position.y + node.height! }
  const rt = { x: node.position.x + node.width!, y: node.position.y }
  const rb = { x: node.position.x + node.width!, y: node.position.y + node.height! }

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

  return 8 < newLen && isSameVector(line, newLine) ? newLine : null
}

export function isSameVector(l1: Line, l2: Line): boolean {
  return l1.s.x < l1.d.x === l2.s.x < l2.d.x && l1.s.y < l1.d.y === l2.s.y < l2.d.y
}
