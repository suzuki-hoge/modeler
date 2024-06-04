import { applyNodeChanges, OnNodesChange } from 'reactflow'

import { Socket } from '@/app/_socket/socket'
import {
  completeDragEnd,
  continueDrag,
  endDrag,
  getLockIds,
  getMovedPositions,
  getUnlockIds,
  isDragContinue,
  isDragEnd,
  isDragStart,
  startDrag,
} from '@/app/_store/state/drag'
import { Store } from '@/app/_store/store'

export function useOnNodesChange(store: Store, socket: Socket): OnNodesChange {
  return (changes) => {
    for (const change of changes) {
      const lastDragHistory = store.dragHistory

      if (change.type === 'position' && isDragStart(change, lastDragHistory)) {
        // start
        const dragHistory = startDrag(change, lastDragHistory)

        // lock
        const lockIds = getLockIds(dragHistory)
        socket.lock(lockIds)
        store.updateLockIds(lockIds)

        // update history
        store.updateDragHistory(dragHistory)
      } else if (change.type === 'position' && isDragEnd(change, lastDragHistory)) {
        // end
        const dragHistory = endDrag(change, lastDragHistory)

        // unlock
        const unlockIds = getUnlockIds(dragHistory)
        getMovedPositions(dragHistory).forEach(({ id, x, y }) => socket.moveNode(id, x, y))
        socket.unlock(unlockIds)
        store.updateLockIds(unlockIds)

        // update history
        store.updateDragHistory(completeDragEnd(unlockIds, dragHistory))
      } else if (change.type === 'position' && isDragContinue(change)) {
        // continue
        const dragHistory = continueDrag(change, lastDragHistory)

        // update history
        store.updateDragHistory(dragHistory)
      }

      if (change.type === 'remove') {
        socket.deleteNode(change.id)
      }
    }

    store.updateNodes((nodes) => applyNodeChanges(changes, nodes))
  }
}
