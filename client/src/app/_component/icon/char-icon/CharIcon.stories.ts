import type { Meta, StoryObj } from '@storybook/react'

import { CharIcon } from './CharIcon'

const meta = {
  title: 'Icon/CharIcon',
  component: CharIcon,
} satisfies Meta<typeof CharIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Icon: Story = {
  args: {
    char: 'UC',
    color: 'lightcyan',
    onClick: () => {
      console.log('click')
    },
  },
}
