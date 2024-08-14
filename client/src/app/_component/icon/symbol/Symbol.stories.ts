import type { Meta, StoryObj } from '@storybook/react'

import { Symbol } from './Symbol'

const meta = {
  title: 'Icon/Symbol',
  component: Symbol,
} satisfies Meta<typeof Symbol>

export default meta
type Story = StoryObj<typeof meta>

export const Icon: Story = {
  args: {
    name: 'line_end_arrow',
  },
}
