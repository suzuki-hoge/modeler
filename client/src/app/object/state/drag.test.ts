import { Map, Set } from 'immutable'

import { DragHistory, getLockIds, getMovedPositions, getUnlockIds } from '@/app/object/state/drag'

test('getLockIds', () => {
  const dragHistory: DragHistory = { current: Map([['1', { x: 1, y: 1 }]]), prev: Map([['2', { x: 2, y: 2 }]]) }
  const exp = Set<string>('1')
  const act = getLockIds(dragHistory)

  expect(act).toEqual(exp)
})

test('getUnlockIds', () => {
  const dragHistory: DragHistory = { current: Map([['1', { x: 1, y: 1 }]]), prev: Map([['2', { x: 2, y: 2 }]]) }
  const exp = Set<string>('2')
  const act = getUnlockIds(dragHistory)

  expect(act).toEqual(exp)
})

test('getMovedPositions', () => {
  const dragHistory: DragHistory = { current: Map([['1', { x: 1, y: 1 }]]), prev: Map([['2', { x: 2, y: 2 }]]) }
  const exp = [{ id: '2', x: 2, y: 2 }]
  const act = getMovedPositions(dragHistory)

  expect(act).toEqual(exp)
})
