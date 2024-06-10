import type { Meta, StoryObj } from '@storybook/react'

import { CompletableInput } from './CompletableInput'

const meta = {
  title: 'Input/CompletableInput',
  component: CompletableInput,
} satisfies Meta<typeof CompletableInput>

export default meta
type Story = StoryObj<typeof meta>

const headers = [
  { id: 'usecase', iconId: 'usecase', name: 'ItemUseCase' },
  { id: 'store', iconId: 'store', name: 'ItemStore' },
  { id: 'item', iconId: 'data', name: 'Item' },
]
const icons = [
  { id: 'usecase', preview: 'UC', desc: 'UseCase', color: 'lightcyan' },
  { id: 'store', preview: 'S', desc: 'Store', color: 'lightgreen' },
  { id: 'data', preview: 'D', desc: 'Data', color: 'lightpink' },
]

export const Input: Story = {
  args: {
    inner: 'foo(a: ref#usecase#, b: ref#store#): ref#item#',
    headers,
    icons,
    readonly: false,
    onChange: console.log,
  },
}

export const Empty: Story = {
  args: {
    inner: '',
    headers,
    icons,
    readonly: false,
    onChange: console.log,
  },
}

export const Readonly: Story = {
  args: {
    inner: 'foo(a: ref#usecase#, b: ref#store#): ref#item#',
    headers,
    icons,
    readonly: true,
    onChange: console.log,
  },
}
