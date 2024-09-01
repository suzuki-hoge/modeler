import type { Meta, StoryObj } from '@storybook/react'

import { ConfigPanel } from './ConfigPanel'

const meta = {
  title: 'config-panel/ConfigPanel',
  component: ConfigPanel,
} satisfies Meta<typeof ConfigPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Component: Story = {
  args: {},
}
