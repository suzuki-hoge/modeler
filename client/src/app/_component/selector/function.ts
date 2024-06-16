export function sortOptions<T extends { value: string }>(ts: T[], sortKey: keyof T, defaultId?: string): T[] {
  const sorted = ts.toSorted((t1, t2) => String(t1[sortKey]).localeCompare(String(t2[sortKey])))
  const i = sorted.findIndex((option) => option.value === defaultId)
  return i !== -1 ? [sorted[i], ...sorted.slice(0, i), ...sorted.slice(i + 1)] : sorted
}

export function getDefault<T extends { value: string }>(ts: T[], defaultId?: string): T | undefined {
  return ts.find((option) => option.value === defaultId)
}
