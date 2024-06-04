import { Set } from 'immutable'

export type LockIds = Set<string>

export function lock(ids: string[], current: LockIds): LockIds {
  return current.merge(...ids)
}

export function unlock(ids: string[], current: LockIds): LockIds {
  return current.filter((id) => !ids.includes(id))
}
