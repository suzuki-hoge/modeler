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
    iconId: 'abc',
    icons: [
      { id: 'abc', preview: 'UC', desc: 'UseCase', color: 'lightcyan' },
      { id: 'def', preview: 'D', desc: 'Domain', color: 'lightgreen' },
    ],
    readonly: false,
    onChange: console.log,
  },
}

export const Readonly: Story = {
  args: {
    iconId: 'abc',
    icons: [
      { id: 'abc', preview: 'UC', desc: 'UseCase', color: 'lightcyan' },
      { id: 'def', preview: 'D', desc: 'Domain', color: 'lightgreen' },
    ],
    readonly: true,
    onChange: console.log,
  },
}
