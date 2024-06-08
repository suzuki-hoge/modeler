import * as Diff from 'diff'
import { Change } from 'diff'

import { NodeHeader2 } from '@/app/_store/node/type'

const re_ref = /(ref#[^#]+#)/g
const re_id = /ref#([^#]+)#/

export type RefString = {
  inner: string
  front: string
}

export function innerToRef(inner: string, headers: NodeHeader2[]): RefString {
  const front = inner
    .split(re_ref)
    .filter((s) => s)
    .map((s) => {
      const id = s.match(re_id)
      return id ? headers.find((header) => header.id === id[1])?.name || '???' : s
    })
    .join('')
  return { inner, front }
}

export function innerToParts(inner: string, headers: NodeHeader2[]): { value: string; ref: boolean }[] {
  return inner
    .split(re_ref)
    .filter((s) => s)
    .map((s) => {
      const id = s.match(re_id)
      return id
        ? { value: headers.find((header) => header.id === id[1])?.name || '???', ref: true }
        : { value: s, ref: false }
    })
}

export function changedByInput(prev: RefString, front: string, headers: NodeHeader2[]): RefString {
  const [changed, next] = apply(prev, front, headers)
  if (changed) {
    return changedByInput(next, front, headers)
  } else {
    return next
  }
}

function apply(prev: RefString, front: string, headers: NodeHeader2[]): [boolean, RefString] {
  const diffs = Diff.diffChars(prev.front, front)
  const firstInsertDiffI = diffs.findIndex((diff) => diff.added)
  const firstDeleteDiffI = diffs.findIndex((diff) => diff.removed)

  const refPositions = findRefPositions(prev.inner, headers)

  if (firstInsertDiffI !== -1 && firstDeleteDiffI !== -1 && firstDeleteDiffI + 1 === firstInsertDiffI) {
    // delete + insert is update
    return [true, applyUpdate(prev, front, diffs, firstDeleteDiffI, firstInsertDiffI, refPositions)]
  }

  if (firstInsertDiffI !== -1) {
    return [true, applyInsert(prev, front, diffs, firstInsertDiffI, refPositions)]
  }

  if (firstDeleteDiffI !== -1) {
    return [true, applyDelete(prev, front, diffs, firstDeleteDiffI, refPositions)]
  }

  // no diff
  return [false, prev]
}

function applyUpdate(
  prev: RefString,
  front: string,
  diffs: Change[],
  deleteDiffI: number,
  insertDiffI: number,
  refPositions: RefPosition[],
): RefString {
  const deleteDiff = diffs[deleteDiffI]
  const insertDiff = diffs[insertDiffI]

  const deletedFrontS = diffs
    .slice(0, deleteDiffI)
    .map((diff) => diff.count || 0)
    .reduce((a, b) => a + b, 0)
  const deletedFrontE = deletedFrontS + deleteDiff.value.length - 1

  const brokenPoss = refPositions.filter(
    ({ frontS, frontE }) =>
      (frontS <= deletedFrontS && deletedFrontS <= frontE) ||
      (frontS <= deletedFrontE && deletedFrontE <= frontE) ||
      (deletedFrontS <= frontS && frontE <= deletedFrontE),
  )

  if (brokenPoss.length !== 0) {
    // break and update
    const lOver = Math.max(head(brokenPoss).frontS - deletedFrontS, 0)
    const rOver = Math.max(deletedFrontE - last(brokenPoss).frontE, 0)
    return {
      inner:
        prev.inner.slice(0, head(brokenPoss).innerS - lOver) +
        insertDiff.value +
        prev.inner.slice(last(brokenPoss).innerE + rOver + 1),
      front:
        prev.front.slice(0, head(brokenPoss).frontS - lOver) +
        insertDiff.value +
        prev.front.slice(last(brokenPoss).frontE + rOver + 1),
    }
  } else {
    // update
    const deletedInnerS =
      refPositions
        .filter(({ frontE }) => frontE <= deletedFrontS)
        .map(({ innerS, innerE, frontS, frontE }) => innerE - innerS - (frontE - frontS))
        .reduce((a, b) => a + b, 0) + deletedFrontS
    return {
      inner:
        prev.inner.slice(0, deletedInnerS) +
        insertDiff.value +
        prev.inner.slice(deletedInnerS + deleteDiff.value.length),
      front:
        prev.front.slice(0, deletedFrontS) +
        insertDiff.value +
        prev.front.slice(deletedFrontS + deleteDiff.value.length),
    }
  }
}

function applyInsert(
  prev: RefString,
  front: string,
  diffs: Change[],
  diffI: number,
  refPositions: RefPosition[],
): RefString {
  const diff = diffs[diffI]

  const insertedFrontS = diffs
    .slice(0, diffI)
    .map((diff) => diff.count || 0)
    .reduce((a, b) => a + b, 0)

  const brokenPos =
    refPositions[refPositions.findIndex(({ frontS, frontE }) => frontS < insertedFrontS && insertedFrontS <= frontE)]
  if (brokenPos) {
    // break and insert
    return {
      inner:
        prev.inner.slice(0, brokenPos.innerS) +
        prev.front.slice(brokenPos.frontS, insertedFrontS) +
        diff.value +
        prev.front.slice(insertedFrontS, brokenPos.frontE + 1) +
        prev.inner.slice(brokenPos.innerE + 1),
      front:
        prev.front.slice(0, brokenPos.frontS) +
        prev.front.slice(brokenPos.frontS, insertedFrontS) +
        diff.value +
        prev.front.slice(insertedFrontS, brokenPos.frontE + 1) +
        prev.front.slice(brokenPos.frontE + 1),
    }
  } else {
    // insert
    const insertedInnerS =
      refPositions
        .filter(({ frontE }) => frontE <= insertedFrontS)
        .map(({ innerS, innerE, frontS, frontE }) => innerE - innerS - (frontE - frontS))
        .reduce((a, b) => a + b, 0) + insertedFrontS
    return {
      inner: prev.inner.slice(0, insertedInnerS) + diff.value + prev.inner.slice(insertedInnerS),
      front: prev.front.slice(0, insertedFrontS) + diff.value + prev.front.slice(insertedFrontS),
    }
  }
}

function applyDelete(
  prev: RefString,
  front: string,
  diffs: Change[],
  diffI: number,
  refPositions: RefPosition[],
): RefString {
  const diff = diffs[diffI]

  const deletedFrontS = diffs
    .slice(0, diffI)
    .map((diff) => diff.count || 0)
    .reduce((a, b) => a + b, 0)
  const deletedFrontE = deletedFrontS + diff.value.length - 1

  const brokenPoss = refPositions.filter(
    ({ frontS, frontE }) =>
      (frontS <= deletedFrontS && deletedFrontS <= frontE) ||
      (frontS <= deletedFrontE && deletedFrontE <= frontE) ||
      (deletedFrontS <= frontS && frontE <= deletedFrontE),
  )
  if (brokenPoss.length !== 0) {
    // break delete
    const lOver = Math.max(head(brokenPoss).frontS - deletedFrontS, 0)
    const rOver = Math.max(deletedFrontE - last(brokenPoss).frontE, 0)
    return {
      inner:
        prev.inner.slice(0, head(brokenPoss).innerS - lOver) +
        prev.front.slice(head(brokenPoss).frontS, deletedFrontS) +
        prev.front.slice(deletedFrontE + 1, last(brokenPoss).frontE + 1) +
        prev.inner.slice(last(brokenPoss).innerE + rOver + 1),
      front:
        prev.front.slice(0, head(brokenPoss).frontS - lOver) +
        prev.front.slice(head(brokenPoss).frontS, deletedFrontS) +
        prev.front.slice(deletedFrontE + 1, last(brokenPoss).frontE + 1) +
        prev.front.slice(last(brokenPoss).frontE + rOver + 1),
    }
  } else {
    // delete
    const deletedInnerS =
      refPositions
        .filter(({ frontE }) => frontE <= deletedFrontS)
        .map(({ innerS, innerE, frontS, frontE }) => innerE - innerS - (frontE - frontS))
        .reduce((a, b) => a + b, 0) + deletedFrontS
    return {
      inner: prev.inner.slice(0, deletedInnerS) + prev.inner.slice(deletedInnerS + diff.value.length),
      front: prev.front.slice(0, deletedFrontS) + prev.front.slice(deletedFrontS + diff.value.length),
    }
  }
}

interface RefPosition {
  innerS: number
  innerE: number
  frontS: number
  frontE: number
}

export function findRefPositions(inner: string, headers: NodeHeader2[]): RefPosition[] {
  const result = []
  let totalRag = 0

  let m
  while ((m = re_ref.exec(inner))) {
    const ref = m[0]
    const id = ref.match(re_id)![1]
    const name = headers.find((header) => header.id === id)?.name || '???'
    const rag = ref.length - name.length
    result.push({
      innerS: m.index,
      innerE: m.index + m[0].length - 1,
      frontS: m.index - totalRag,
      frontE: m.index + m[0].length - 1 - (totalRag + rag),
    })
    totalRag += rag
  }
  return result
}

export function changedBySelect(
  prev: RefString,
  headers: NodeHeader2[],
  id: string,
  name: string,
  cursorFrontS: number,
): RefString {
  const refPositions = findRefPositions(prev.inner, headers)

  const brokenPos =
    refPositions[refPositions.findIndex(({ frontS, frontE }) => frontS < cursorFrontS && cursorFrontS <= frontE)]

  if (brokenPos) {
    // break and insert
    return {
      inner: prev.inner.slice(0, brokenPos.innerS) + `ref#${id}#` + prev.inner.slice(brokenPos.innerE + 1),
      front: prev.front.slice(0, brokenPos.frontS) + name + prev.front.slice(brokenPos.frontE + 1),
    }
  } else {
    // insert
    const insertedInnerS =
      refPositions
        .filter(({ frontE }) => frontE <= cursorFrontS)
        .map(({ innerS, innerE, frontS, frontE }) => innerE - innerS - (frontE - frontS))
        .reduce((a, b) => a + b, 0) + cursorFrontS
    return {
      inner: prev.inner.slice(0, insertedInnerS) + `ref#${id}#` + prev.inner.slice(insertedInnerS),
      front: prev.front.slice(0, cursorFrontS) + name + prev.front.slice(cursorFrontS),
    }
  }
}

function head<T>(xs: T[]): T {
  return xs[0]
}

function last<T>(xs: T[]): T {
  return xs[xs.length - 1]
}
