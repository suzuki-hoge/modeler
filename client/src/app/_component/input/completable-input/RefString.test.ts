import {
  changedByInput,
  changedBySelect,
  innerToParts,
  innerToRef,
  RefString,
} from '@/app/_component/input/completable-input/RefString'
import { NodeHeader } from '@/app/_object/node/type'

const headers: NodeHeader[] = [
  { id: '123', iconId: 'abc', name: 'Foo' },
  { id: '456', iconId: 'def', name: 'Bar' },
]

test.each`
  inner                              | exp
  ${'foo(a: ref#123#, b: ref#456#)'} | ${'foo(a: Foo, b: Bar)'}
  ${'foo(a: Int, b: Int)'}           | ${'foo(a: Int, b: Int)'}
  ${'foo(a: ref#789#)'}              | ${'foo(a: ???)'}
`('innerToRef: $label', ({ inner, exp }: { inner: string; exp: string }) => {
  const act = innerToRef(inner, headers).front
  expect(act).toStrictEqual(exp)
})

test.each`
  inner                              | exp
  ${'foo(a: ref#123#, b: ref#456#)'} | ${[{ value: 'foo(a: ', ref: false }, { value: 'Foo', ref: true }, { value: ', b: ', ref: false }, { value: 'Bar', ref: true }, { value: ')', ref: false }]}
  ${'foo(a: Int, b: Int)'}           | ${[{ value: 'foo(a: Int, b: Int)', ref: false }]}
  ${'ref#123#'}                      | ${[{ value: 'Foo', ref: true }]}
  ${'ref#789#'}                      | ${[{ value: '???', ref: true }]}
`('innerToParts: $label', ({ inner, exp }: { inner: string; exp: { value: string; ref: boolean }[] }) => {
  const act = innerToParts(inner, headers)
  expect(act).toStrictEqual(exp)
})

const ref = { inner: 'foo(a: ref#123#, b: ref#456#)', front: 'foo(a: Foo, b: Bar)' }

test.each`
  label                                 | ref    | front                          | exp
  ${'insert before ref'}                | ${ref} | ${'foo2(a: Foo, b: Bar)'}      | ${{ inner: 'foo2(a: ref#123#, b: ref#456#)', front: 'foo2(a: Foo, b: Bar)' }}
  ${'insert before ref multi'}          | ${ref} | ${'foo23(a: Foo, b: Bar)'}     | ${{ inner: 'foo23(a: ref#123#, b: ref#456#)', front: 'foo23(a: Foo, b: Bar)' }}
  ${'insert after ref'}                 | ${ref} | ${'foo(a: Foo, b: Bar):'}      | ${{ inner: 'foo(a: ref#123#, b: ref#456#):', front: 'foo(a: Foo, b: Bar):' }}
  ${'insert after ref multi'}           | ${ref} | ${'foo(a: Foo, b: Bar): Int'}  | ${{ inner: 'foo(a: ref#123#, b: ref#456#): Int', front: 'foo(a: Foo, b: Bar): Int' }}
  ${'insert just before ref'}           | ${ref} | ${'foo(a:  Foo, b: Bar)'}      | ${{ inner: 'foo(a:  ref#123#, b: ref#456#)', front: 'foo(a:  Foo, b: Bar)' }}
  ${'insert just before ref multi'}     | ${ref} | ${'foo(a:   Foo, b: Bar)'}     | ${{ inner: 'foo(a:   ref#123#, b: ref#456#)', front: 'foo(a:   Foo, b: Bar)' }}
  ${'insert just after ref'}            | ${ref} | ${'foo(a: Foo , b: Bar)'}      | ${{ inner: 'foo(a: ref#123# , b: ref#456#)', front: 'foo(a: Foo , b: Bar)' }}
  ${'insert just after ref multi'}      | ${ref} | ${'foo(a: Foo  , b: Bar)'}     | ${{ inner: 'foo(a: ref#123#  , b: ref#456#)', front: 'foo(a: Foo  , b: Bar)' }}
  ${'first break insert'}               | ${ref} | ${'foo(a: F2oo, b: Bar)'}      | ${{ inner: 'foo(a: F2oo, b: ref#456#)', front: 'foo(a: F2oo, b: Bar)' }}
  ${'first break insert multi'}         | ${ref} | ${'foo(a: F23oo, b: Bar)'}     | ${{ inner: 'foo(a: F23oo, b: ref#456#)', front: 'foo(a: F23oo, b: Bar)' }}
  ${'second break insert'}              | ${ref} | ${'foo(a: Foo, b: Ba2r)'}      | ${{ inner: 'foo(a: ref#123#, b: Ba2r)', front: 'foo(a: Foo, b: Ba2r)' }}
  ${'second break insert multi'}        | ${ref} | ${'foo(a: Foo, b: Ba23r)'}     | ${{ inner: 'foo(a: ref#123#, b: Ba23r)', front: 'foo(a: Foo, b: Ba23r)' }}
  ${'delete before ref'}                | ${ref} | ${'foo(: Foo, b: Bar)'}        | ${{ inner: 'foo(: ref#123#, b: ref#456#)', front: 'foo(: Foo, b: Bar)' }}
  ${'delete before ref multi'}          | ${ref} | ${'foo( Foo, b: Bar)'}         | ${{ inner: 'foo( ref#123#, b: ref#456#)', front: 'foo( Foo, b: Bar)' }}
  ${'delete after ref'}                 | ${ref} | ${'foo(a: Foo, : Bar)'}        | ${{ inner: 'foo(a: ref#123#, : ref#456#)', front: 'foo(a: Foo, : Bar)' }}
  ${'delete after ref multi'}           | ${ref} | ${'foo(a: Foo,  Bar)'}         | ${{ inner: 'foo(a: ref#123#,  ref#456#)', front: 'foo(a: Foo,  Bar)' }}
  ${'delete just before ref'}           | ${ref} | ${'foo(a:Foo, b: Bar)'}        | ${{ inner: 'foo(a:ref#123#, b: ref#456#)', front: 'foo(a:Foo, b: Bar)' }}
  ${'delete just before ref multi'}     | ${ref} | ${'foo(aFoo, b: Bar)'}         | ${{ inner: 'foo(aref#123#, b: ref#456#)', front: 'foo(aFoo, b: Bar)' }}
  ${'delete just after ref'}            | ${ref} | ${'foo(a: Foo , b: Bar)'}      | ${{ inner: 'foo(a: ref#123# , b: ref#456#)', front: 'foo(a: Foo , b: Bar)' }}
  ${'delete just after ref multi'}      | ${ref} | ${'foo(a: Foo  , b: Bar)'}     | ${{ inner: 'foo(a: ref#123#  , b: ref#456#)', front: 'foo(a: Foo  , b: Bar)' }}
  ${'first break delete'}               | ${ref} | ${'foo(a: oo, b: Bar)'}        | ${{ inner: 'foo(a: oo, b: ref#456#)', front: 'foo(a: oo, b: Bar)' }}
  ${'first break delete multi'}         | ${ref} | ${'foo(a: o, b: Bar)'}         | ${{ inner: 'foo(a: o, b: ref#456#)', front: 'foo(a: o, b: Bar)' }}
  ${'second break delete'}              | ${ref} | ${'foo(a: Foo, b: Ba)'}        | ${{ inner: 'foo(a: ref#123#, b: Ba)', front: 'foo(a: Foo, b: Ba)' }}
  ${'second break delete multi'}        | ${ref} | ${'foo(a: Foo, b: B)'}         | ${{ inner: 'foo(a: ref#123#, b: B)', front: 'foo(a: Foo, b: B)' }}
  ${'break delete left half over ref'}  | ${ref} | ${'foo(a:oo, b: Bar)'}         | ${{ inner: 'foo(a:oo, b: ref#456#)', front: 'foo(a:oo, b: Bar)' }}
  ${'break delete right half over ref'} | ${ref} | ${'foo(a: Foo, b: Ba'}         | ${{ inner: 'foo(a: ref#123#, b: Ba', front: 'foo(a: Foo, b: Ba' }}
  ${'break delete full over ref'}       | ${ref} | ${'foo(b: Bar)'}               | ${{ inner: 'foo(b: ref#456#)', front: 'foo(b: Bar)' }}
  ${'break delete over refs'}           | ${ref} | ${'foo()'}                     | ${{ inner: 'foo()', front: 'foo()' }}
  ${'change'}                           | ${ref} | ${'fo2(a: Foo, b: Bar)'}       | ${{ inner: 'fo2(a: ref#123#, b: ref#456#)', front: 'fo2(a: Foo, b: Bar)' }}
  ${'change multi'}                     | ${ref} | ${'f23(a: Foo, b: Bar)'}       | ${{ inner: 'f23(a: ref#123#, b: ref#456#)', front: 'f23(a: Foo, b: Bar)' }}
  ${'update'}                           | ${ref} | ${'full(a: Foo, b: Bar)'}      | ${{ inner: 'full(a: ref#123#, b: ref#456#)', front: 'full(a: Foo, b: Bar)' }}
  ${'break update left half over ref'}  | ${ref} | ${'foo(a:Int, b: Bar)'}        | ${{ inner: 'foo(a:Int, b: ref#456#)', front: 'foo(a:Int, b: Bar)' }}
  ${'break update right half over ref'} | ${ref} | ${'foo(a: Foo, b: Int = 0)'}   | ${{ inner: 'foo(a: ref#123#, b: Int = 0)', front: 'foo(a: Foo, b: Int = 0)' }}
  ${'break update full over ref'}       | ${ref} | ${'foo(a:Number, b: Bar)'}     | ${{ inner: 'foo(a:Number, b: ref#456#)', front: 'foo(a:Number, b: Bar)' }}
  ${'break update over refs'}           | ${ref} | ${'foo(Int)'}                  | ${{ inner: 'foo(Int)', front: 'foo(Int)' }}
  ${'insert and insert'}                | ${ref} | ${'foo2(a: Foo, b: Bar): Int'} | ${{ inner: 'foo2(a: ref#123#, b: ref#456#): Int', front: 'foo2(a: Foo, b: Bar): Int' }}
  ${'insert and delete'}                | ${ref} | ${'foo2(a: Foo, b: Bar'}       | ${{ inner: 'foo2(a: ref#123#, b: ref#456#', front: 'foo2(a: Foo, b: Bar' }}
  ${'insert and update'}                | ${ref} | ${'foo2(a: Foo, b: Bar, '}     | ${{ inner: 'foo2(a: ref#123#, b: ref#456#, ', front: 'foo2(a: Foo, b: Bar, ' }}
  ${'break delete and break insert'}    | ${ref} | ${'foo(a: Fo, b: Ba2r)'}       | ${{ inner: 'foo(a: Fo, b: Ba2r)', front: 'foo(a: Fo, b: Ba2r)' }}
  ${'break delete and break delete'}    | ${ref} | ${'foo(a: Fo, b: Ba)'}         | ${{ inner: 'foo(a: Fo, b: Ba)', front: 'foo(a: Fo, b: Ba)' }}
  ${'break delete and break update'}    | ${ref} | ${'foo(a: Fo, b: Ban)'}        | ${{ inner: 'foo(a: Fo, b: Ban)', front: 'foo(a: Fo, b: Ban)' }}
  ${'no diff'}                          | ${ref} | ${'foo(a: Foo, b: Bar)'}       | ${{ inner: 'foo(a: ref#123#, b: ref#456#)', front: 'foo(a: Foo, b: Bar)' }}
`('changedByInput: $label', ({ ref, front, exp }: { ref: RefString; front: string; exp: RefString }) => {
  const act = changedByInput(ref, front, headers)
  expect(act).toStrictEqual(exp)
})

interface ChangedBySelectProps {
  prev: RefString
  id: string
  label: string
  cursor: number
  expRefString: RefString
  expCursor: number
}

test.each`
  prev   | id       | label    | cursor | expRefString                                                                           | expCursor
  ${ref} | ${'456'} | ${'Bar'} | ${0}   | ${{ inner: 'ref#456#foo(a: ref#123#, b: ref#456#)', front: 'Barfoo(a: Foo, b: Bar)' }} | ${3}
  ${ref} | ${'456'} | ${'Bar'} | ${19}  | ${{ inner: 'foo(a: ref#123#, b: ref#456#)ref#456#', front: 'foo(a: Foo, b: Bar)Bar' }} | ${22}
  ${ref} | ${'456'} | ${'Bar'} | ${8}   | ${{ inner: 'foo(a: ref#456#, b: ref#456#)', front: 'foo(a: Bar, b: Bar)' }}            | ${10}
`('changedBySelect', ({ prev, id, label, cursor, expRefString, expCursor }: ChangedBySelectProps) => {
  const [nextRefString, nextCursor] = changedBySelect(prev, headers, id, label, cursor)
  expect(nextRefString).toStrictEqual(expRefString)
  expect(nextCursor).toStrictEqual(expCursor)
})
