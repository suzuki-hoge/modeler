import type { Meta, StoryObj } from '@storybook/react'

import { ClassIcon } from './ClassIcon'

const meta = {
  title: 'Input/ClassIcon',
  component: ClassIcon,
} satisfies Meta<typeof ClassIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Input: Story = {
  args: {
    icon: { preview: 'UC', desc: 'UseCase', color: 'lightcyan' },
    icons: [
      { preview: 'UC', desc: 'UseCase', color: 'lightcyan' },
      { preview: 'D', desc: 'Domain', color: 'lightgreen' },
    ],
    readonly: false,
    onChange: console.log,
  },
}

export const Readonly: Story = {
  args: {
    icon: { preview: 'UC', desc: 'UseCase', color: 'lightcyan' },
    icons: [
      { preview: 'UC', desc: 'UseCase', color: 'lightcyan' },
      { preview: 'D', desc: 'Domain', color: 'lightgreen' },
    ],
    readonly: true,
  },
}
