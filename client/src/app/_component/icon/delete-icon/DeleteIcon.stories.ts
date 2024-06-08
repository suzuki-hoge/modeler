import type { Meta, StoryObj } from '@storybook/react'

import { DeleteIcon } from './DeleteIcon'

const meta = {
  title: 'Icon/DeleteIcon',
  component: DeleteIcon,
} satisfies Meta<typeof DeleteIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Icon: Story = {
  args: {
    onClick: () => {
      console.log('click')
    },
  },
}
