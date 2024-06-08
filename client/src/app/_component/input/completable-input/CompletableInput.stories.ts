import type { Meta, StoryObj } from '@storybook/react'

import { CompletableInput } from './CompletableInput'

const meta = {
  title: 'Input/CompletableInput',
  component: CompletableInput,
} satisfies Meta<typeof CompletableInput>

export default meta
type Story = StoryObj<typeof meta>

export const Input: Story = {
  args: {
    inner: 'foo(a: ref#123#, b: ref#456#)',
    readonly: false,
    onChange: console.log,
  },
}

export const Readonly: Story = {
  args: {
    inner: 'foo(a: ref#123#, b: ref#456#)',
    readonly: true,
  },
}
