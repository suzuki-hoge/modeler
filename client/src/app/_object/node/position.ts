import { XYPosition } from 'reactflow'

export function randomAround(x: number, y: number, w: number, h: number, d: number): XYPosition {
  const centerX = x + w / 2
  const centerY = y + h / 2
  const angle = Math.random() * Math.PI * 2

  return { x: centerX + d * Math.cos(angle), y: centerY + d * Math.sin(angle) }
}
