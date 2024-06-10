import type { Meta, StoryObj } from '@storybook/react'

import { GeneralizationArrowIcon } from './GeneralizationArrowIcon'

const meta = {
  title: 'Icon/GeneralizationArrowIcon',
  component: GeneralizationArrowIcon,
} satisfies Meta<typeof GeneralizationArrowIcon>

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
