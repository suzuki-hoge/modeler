import type { Meta, StoryObj } from '@storybook/react'

import { Foo } from './Foo'

const meta = {
  title: 'Foo',
  component: Foo,
} satisfies Meta<typeof Foo>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    s: 'foo',
  },
}
