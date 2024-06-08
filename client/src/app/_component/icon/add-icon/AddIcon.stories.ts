import type { Meta, StoryObj } from '@storybook/react'

import { AddIcon } from './AddIcon'

const meta = {
  title: 'Icon/AddIcon',
  component: AddIcon,
} satisfies Meta<typeof AddIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Icon: Story = {
  args: {
    onClick: () => {
      console.log('click')
    },
  },
}
