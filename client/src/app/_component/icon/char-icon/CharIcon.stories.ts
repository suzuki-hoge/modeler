import type { Meta, StoryObj } from '@storybook/react'

import { CharIcon } from './CharIcon'

const meta = {
  title: 'Icon/CharIcon',
  component: CharIcon,
} satisfies Meta<typeof CharIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Small: Story = {
  args: {
    char: 'UC',
    color: 'lightcyan',
    variant: 'small',
    onClick: () => {
      console.log('click')
    },
  },
}

export const Medium: Story = {
  args: {
    char: 'UC',
    color: 'lightcyan',
    variant: 'medium',
    onClick: () => {
      console.log('click')
    },
  },
}
