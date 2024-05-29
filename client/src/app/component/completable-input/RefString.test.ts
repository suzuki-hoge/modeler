import { NodeNames, parseFront, parseInner } from '@/app/component/completable-input/RefString'
import {
  FrontRefString,
  InnerRefString,
  pop,
  pushChar,
  pushRefFront,
  pushRefInner,
} from '@/app/component/completable-input/RefString'

const names: NodeNames = { '123': 'Foo', '456': 'Bar' }

interface ParseFrontProps {
  s: string
  exp: FrontRefString
}

test.each`
  s                             | exp
  ${'a: ref#123#, b: ref#456#'} | ${[{ value: 'a: ', ref: false }, { value: 'ref#123#', ref: true }, { value: ', b: ', ref: false }, { value: 'ref#456#', ref: true }]}
`('parseFront', ({ s, exp }: ParseFrontProps) => {
  const act = parseFront(s)
  expect(act).toStrictEqual(exp)
})

interface ParseInnerProps {
  s: string
  names: NodeNames
  exp: InnerRefString
}

test.each`
  s                             | names    | exp
  ${'a: ref#123#, b: ref#456#'} | ${names} | ${[{ value: 'a: ', ref: false }, { value: 'Foo', ref: true }, { value: ', b: ', ref: false }, { value: 'Bar', ref: true }]}
`('parseInner', ({ s, names, exp }: ParseInnerProps) => {
  const act = parseInner(s, names)
  expect(act).toStrictEqual(exp)
})

interface PutCharProps {
  refString: FrontRefString | InnerRefString
  c: string
  exp: FrontRefString | InnerRefString
}

test.each`
  refString                       | c      | exp
  ${[]}                           | ${'x'} | ${[{ value: 'x', ref: false }]}
  ${[{ value: 'x', ref: false }]} | ${'y'} | ${[{ value: 'xy', ref: false }]}
  ${[{ value: 'x', ref: true }]}  | ${'y'} | ${[{ value: 'x', ref: true }, { value: 'y', ref: false }]}
`('pushChar', ({ refString, c, exp }: PutCharProps) => {
  const act = pushChar(refString, c)
  expect(act).toStrictEqual(exp)
})

interface PushRefFrontProps {
  refString: FrontRefString
  label: string
  exp: FrontRefString
}

test.each`
  refString                       | label  | exp
  ${[]}                           | ${'x'} | ${[{ value: 'x', ref: true }]}
  ${[{ value: 'x', ref: false }]} | ${'y'} | ${[{ value: 'x', ref: false }, { value: 'y', ref: true }]}
  ${[{ value: 'x', ref: true }]}  | ${'y'} | ${[{ value: 'x', ref: true }, { value: 'y', ref: true }]}
`('pushRefFront', ({ refString, label, exp }: PushRefFrontProps) => {
  const act = pushRefFront(refString, label)
  expect(act).toStrictEqual(exp)
})

interface PushRefInnerProps {
  refString: InnerRefString
  id: string
  exp: InnerRefString
}

test.each`
  refString                             | id       | exp
  ${[]}                                 | ${'123'} | ${[{ value: 'ref#123#', ref: true }]}
  ${[{ value: 'x', ref: false }]}       | ${'123'} | ${[{ value: 'x', ref: false }, { value: 'ref#123#', ref: true }]}
  ${[{ value: 'ref#123#', ref: true }]} | ${'456'} | ${[{ value: 'ref#123#', ref: true }, { value: 'ref#456#', ref: true }]}
`('pushRefInner', ({ refString, id, exp }: PushRefInnerProps) => {
  const act = pushRefInner(refString, id)
  expect(act).toStrictEqual(exp)
})

interface PopProps {
  refString: FrontRefString | InnerRefString
  exp: FrontRefString | InnerRefString
}

test.each`
  refString                                                          | exp
  ${[]}                                                              | ${[]}
  ${[{ value: 'xy', ref: false }]}                                   | ${[{ value: 'x', ref: false }]}
  ${[{ value: 'x', ref: false }]}                                    | ${[]}
  ${[{ value: 'ref#123#', ref: true }]}                              | ${[]}
  ${[{ value: 'ref#123#', ref: true }, { value: 'x', ref: true }]}   | ${[{ value: 'ref#123#', ref: true }]}
  ${[{ value: 'ref#123#', ref: true }, { value: 'xy', ref: false }]} | ${[{ value: 'ref#123#', ref: true }, { value: 'x', ref: false }]}
  ${[{ value: 'x', ref: false }, { value: 'ref#123#', ref: true }]}  | ${[{ value: 'x', ref: false }]}
`('pop', ({ refString, exp }: PopProps) => {
  const act = pop(refString)
  expect(act).toStrictEqual(exp)
})
