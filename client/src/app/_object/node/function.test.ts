import { insertMethod, insertProperty } from '@/app/_object/node/function'
import { NodeData } from '@/app/_object/node/type'

test('insertProperty - empty', () => {
  const data: NodeData = { iconId: 'default', name: 'Item', properties: [], methods: [] }
  const exp = ['value: Int']
  const act = insertProperty(data, 'value: Int', 0).properties

  expect(act).toEqual(exp)
})

test('insertProperty - last', () => {
  const data: NodeData = { iconId: 'default', name: 'Item', properties: ['id: Int'], methods: [] }
  const exp = ['id: Int', 'value: Int']
  const act = insertProperty(data, 'value: Int', 0).properties

  expect(act).toEqual(exp)
})

test('insertProperty - middle', () => {
  const data: NodeData = { iconId: 'default', name: 'Item', properties: ['id: Int', 'type: String'], methods: [] }
  const exp = ['id: Int', 'value: Int', 'type: String']
  const act = insertProperty(data, 'value: Int', 0).properties

  expect(act).toEqual(exp)
})

test('insertMethod - empty', () => {
  const data: NodeData = { iconId: 'default', name: 'Item', properties: [], methods: [] }
  const exp = ['set(value: Int)']
  const act = insertMethod(data, 'set(value: Int)', 0).methods

  expect(act).toEqual(exp)
})

test('insertProperty - last', () => {
  const data: NodeData = { iconId: 'default', name: 'Item', properties: [], methods: ['run()'] }
  const exp = ['run()', 'set(value: Int)']
  const act = insertMethod(data, 'set(value: Int)', 0).methods

  expect(act).toEqual(exp)
})

test('insertMethod - middle', () => {
  const data: NodeData = { iconId: 'default', name: 'Item', properties: [], methods: ['run()', 'get(): Int'] }
  const exp = ['run()', 'set(value: Int)', 'get(): Int']
  const act = insertMethod(data, 'set(value: Int)', 0).methods

  expect(act).toEqual(exp)
})
