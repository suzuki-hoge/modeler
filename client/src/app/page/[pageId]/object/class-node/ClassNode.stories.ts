import type { Meta, StoryObj } from '@storybook/react'

import { ClassNode } from './ClassNode'

const meta = {
  title: 'ClassNode',
  component: ClassNode,
  argTypes: {},
} satisfies Meta<typeof ClassNode>

export default meta
type Story = StoryObj<typeof meta>

export const Item: Story = {
  args: {
    data: {
      icon: 'DC',
      name: 'Item<T>',
      properties: ['- t: T', '- caching: Bool'],
      methods: ['+ get(): T', '- set(t: T)'],
    },
  },
}

export const ItemRepository: Story = {
  args: {
    data: {
      icon: 'R',
      name: 'ItemRepository',
      properties: [],
      methods: [],
    },
  },
}
