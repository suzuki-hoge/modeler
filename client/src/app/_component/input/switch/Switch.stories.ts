import type { Meta, StoryObj } from '@storybook/react'

import { Switch } from './Switch'

const meta = {
  title: 'Input/Switch',
  component: Switch,
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const On: Story = {
  args: {
    checked: true,
    onChange: console.log,
  },
}

export const Off: Story = {
  args: {
    checked: false,
    onChange: console.log,
  },
}
