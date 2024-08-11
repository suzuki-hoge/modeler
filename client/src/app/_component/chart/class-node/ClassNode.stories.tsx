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
    data: {
      iconId: 'store',
      name: 'ItemStore',
      properties: [],
      methods: ['findAll(): List<ref#item#>', 'save(item: ref#item#)'],
    },
    headers: [
      { id: 'usecase', iconId: 'usecase', name: 'ItemUseCase' },
      { id: 'store', iconId: 'store', name: 'ItemStore' },
      { id: 'item', iconId: 'data', name: 'Item' },
    ],
    icons: [
      { id: 'usecase', preview: 'UC', desc: 'UseCase', color: 'lightcyan' },
      { id: 'store', preview: 'S', desc: 'Store', color: 'lightgreen' },
      { id: 'data', preview: 'D', desc: 'Data', color: 'lightpink' },
    ],
    onChangeName: console.log,
    onChangeIconId: console.log,
    onChangeProperties: console.log,
    onChangeMethods: console.log,
    newNodePosition: { x: 0, y: 0 },
    onPostNodeCreate: console.log,
    onPostNodeSelect: console.log,
  },
}
