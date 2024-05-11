import type { Meta, StoryObj } from '@storybook/react'

import { ClassNode } from './ClassNode'

const meta = {
  title: 'ClassNode',
  component: ClassNode,
  argTypes: {},
} satisfies Meta<typeof ClassNode>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {},
}
