import type { Meta, StoryObj } from '@storybook/react'

import { RotateIcon } from './RotateIcon'

const meta = {
  title: 'Icon/RotateIcon',
  component: RotateIcon,
} satisfies Meta<typeof RotateIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Icon: Story = {
  args: {
    onClick: () => {
      console.log('click')
    },
  },
}
