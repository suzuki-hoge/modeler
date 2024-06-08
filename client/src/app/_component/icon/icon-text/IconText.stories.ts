import type { Meta, StoryObj } from '@storybook/react'

import { IconText } from './IconText'

const meta = {
  title: 'Icon/IconText',
  component: IconText,
} satisfies Meta<typeof IconText>

export default meta
type Story = StoryObj<typeof meta>

export const Icon: Story = {
  args: {
    icon: 'C',
    color: 'lightcyan',
    desc: 'Controller',
  },
}

export const Class: Story = {
  args: {
    icon: 'C',
    color: 'lightcyan',
    desc: 'UserController',
  },
}
