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
    preview: 'C',
    color: 'lightcyan',
    desc: 'Controller',
  },
}

export const Class: Story = {
  args: {
    preview: 'C',
    color: 'lightpink',
    desc: 'UserController',
  },
}
