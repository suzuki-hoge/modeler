import type { Meta, StoryObj } from '@storybook/react'

import { ClassName } from './ClassName'

const meta = {
  title: 'Input/ClassName',
  component: ClassName,
} satisfies Meta<typeof ClassName>

export default meta
type Story = StoryObj<typeof meta>

export const Input: Story = {
  args: {
    name: 'UserService',
    readonly: false,
    onChange: console.log,
  },
}

export const Readonly: Story = {
  args: {
    name: 'UserService',
    readonly: true,
  },
}
