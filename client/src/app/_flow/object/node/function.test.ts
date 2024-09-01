import { insertString } from '@/app/_flow/object/node/function'

test('insertString - empty', () => {
  const exp = ['value: Int']
  const act = insertString([], 'value: Int', 0)

  expect(act).toEqual(exp)
})

test('insertString - last', () => {
  const exp = ['id: Int', 'value: Int']
  const act = insertString(['id: Int'], 'value: Int', 0)

  expect(act).toEqual(exp)
})

test('insertString - middle', () => {
  const exp = ['id: Int', 'value: Int', 'type: String']
  const act = insertString(['id: Int', 'type: String'], 'value: Int', 0)

  expect(act).toEqual(exp)
})
