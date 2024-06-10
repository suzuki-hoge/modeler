import type { Meta, StoryObj } from '@storybook/react'

import { ClassNodeInner } from './ClassNode'

const meta = {
  title: 'Chart/ClassNodeInner',
  component: ClassNodeInner,
} satisfies Meta<typeof ClassNodeInner>

export default meta
type Story = StoryObj<typeof meta>

export const Node: Story = {
  args: {
    id: 'store',
    isSelected: false,
    isLocked: false,
    data: {
      iconId: 'store',
      name: 'ItemStore',
      properties: [],
      methods: ['findAll(): List<ref#item#>', 'save(item: ref#item#)'],
    },
    icons: [
      { id: 'usecase', preview: 'UC', desc: 'UseCase', color: 'lightcyan' },
      { id: 'store', preview: 'S', desc: 'Store', color: 'lightgreen' },
      { id: 'data', preview: 'D', desc: 'Data', color: 'lightpink' },
    ],
    headers: [
      { id: 'usecase', iconId: 'usecase', name: 'ItemUseCase' },
      { id: 'store', iconId: 'store', name: 'ItemStore' },
      { id: 'item', iconId: 'data', name: 'Item' },
    ],
    onChangeName: console.log,
    onChangeIconId: console.log,
    onInsertProperties: [],
    onUpdateProperties: [],
    onDeleteProperties: [],
    onInsertFirstProperty: console.log,
    onInsertMethods: [console.log, console.log],
    onUpdateMethods: [console.log, console.log],
    onDeleteMethods: [console.log, console.log],
    onInsertFirstMethod: console.log,
    children: <></>,
  },
}
