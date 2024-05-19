import { Map, Set } from 'immutable'
import { NodePositionChange } from 'reactflow'

// drag

export type DragHistory = {
  current: Map<string, { x: number; y: number }>
  prev: Map<string, { x: number; y: number }>
}

export function initDragHistory(): DragHistory {
  return { current: Map(), prev: Map() }
}

export function isDragStart(change: NodePositionChange, { current }: DragHistory): boolean {
  return !!change.dragging && !current.has(change.id)
}

export function isDragEnd(change: NodePositionChange, { current, prev }: DragHistory): boolean {
  return !change.dragging && current.has(change.id) && prev.has(change.id)
}

export function isDragContinue(change: NodePositionChange): boolean {
  return !!change.dragging
}

export function startDrag(change: NodePositionChange, { current, prev }: DragHistory): DragHistory {
  return { current: current.set(change.id, change.position!), prev }
}

export function endDrag(change: NodePositionChange, { current, prev }: DragHistory): DragHistory {
  return { current: current.delete(change.id), prev }
}

export function continueDrag(change: NodePositionChange, { current }: DragHistory): DragHistory {
  return { current: current.set(change.id, change.position!), prev: current }
}

export function completeDragEnd(ids: LockIds | string[], { current, prev }: DragHistory): DragHistory {
  return { current, prev: prev.deleteAll(ids) }
}

export function getLockIds({ current, prev }: DragHistory): LockIds {
  return Set(Array.from(current.keys()).filter((id) => !prev.has(id)))
}

export function getUnlockIds({ current, prev }: DragHistory): LockIds {
  return Set(Array.from(prev.keys()).filter((id) => !current.has(id)))
}

export function getMovedPositions({ current, prev }: DragHistory): { id: string; x: number; y: number }[] {
  return getUnlockIds({ current, prev })
    .toArray()
    .map((id) => ({ id, ...prev.get(id)! }))
}

// lock

export type LockIds = Set<string>

export function lock(ids: string[], current: LockIds): LockIds {
  return current.merge(...ids)
}

export function unlock(ids: string[], current: LockIds): LockIds {
  return current.filter((id) => !ids.includes(id))
}
