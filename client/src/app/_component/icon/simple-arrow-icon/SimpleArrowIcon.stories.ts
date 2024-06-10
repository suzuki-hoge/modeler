import type { Meta, StoryObj } from '@storybook/react'

import { SimpleArrowIcon } from './SimpleArrowIcon'

const meta = {
  title: 'Icon/SimpleArrowIcon',
  component: SimpleArrowIcon,
} satisfies Meta<typeof SimpleArrowIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Right: Story = {
  args: {
    vector: 'right',
  },
}

export const Down: Story = {
  args: {
    vector: 'down',
  },
}

export const Left: Story = {
  args: {
    vector: 'left',
  },
}

export const Up: Story = {
  args: {
    vector: 'up',
  },
}
