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
    onClick: () => {
      console.log('click')
    },
  },
}

export const Down: Story = {
  args: {
    vector: 'down',
    onClick: () => {
      console.log('click')
    },
  },
}

export const Left: Story = {
  args: {
    vector: 'left',
    onClick: () => {
      console.log('click')
    },
  },
}

export const Up: Story = {
  args: {
    vector: 'up',
    onClick: () => {
      console.log('click')
    },
  },
}
