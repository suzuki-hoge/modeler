import { LockIds } from '@/app/_object/state/type'

export function lock(id: string, current: LockIds): LockIds {
  return current.add(id)
}

export function unlock(id: string, current: LockIds): LockIds {
  return current.delete(id)
}
