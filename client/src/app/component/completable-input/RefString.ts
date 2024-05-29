export type FrontRefString = { value: string; ref: boolean }[]
export type InnerRefString = { value: string; ref: boolean }[]
export type NodeNames = { [id: string]: string }

export function parseFront(s: string): FrontRefString {}

export function parseInner(s: string, names: NodeNames): InnerRefString {}

export function pushChar(refString: FrontRefString | InnerRefString, c: string): FrontRefString | InnerRefString {
  if (empty(refString)) {
    return [{ value: c, ref: false }]
  } else if (last(refString).ref) {
    return [...refString, { value: c, ref: false }]
  } else {
    return [...refString.slice(0, -1), { value: last(refString).value + c, ref: false }]
  }
}

export function pushRefFront(refString: FrontRefString, label: string): FrontRefString {
  return [...refString, { value: label, ref: true }]
}

export function pushRefInner(refString: InnerRefString, id: string): InnerRefString {
  return [...refString, { value: `ref#${id}#`, ref: true }]
}

export function pop(refString: FrontRefString | InnerRefString): FrontRefString | InnerRefString {
  if (empty(refString)) {
    return refString
  } else if (last(refString).ref) {
    return [...refString.slice(0, -1)]
  } else if (last(refString).value.length === 1) {
    return [...refString.slice(0, -1)]
  } else {
    return [...refString.slice(0, -1), { value: last(refString).value.slice(0, -1), ref: false }]
  }
}

function empty<T>(xs: T[]): boolean {
  return xs.length === 0
}

function last<T>(xs: T[]): T {
  return xs[xs.length - 1]
}
