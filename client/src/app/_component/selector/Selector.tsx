'use client'

import React, { ReactNode, useEffect, useRef } from 'react'
import Select from 'react-select'
import SelectBase from 'react-select/base'

import { getDefault, sortOptions } from '@/app/_component/selector/function'

type Option<Choice> = Choice & { value: string }

export interface SelectorProps<Choice> {
  x: string
  y: string
  width: string
  placeholder: string
  empty: string
  choices: Choice[]
  defaultId?: string
  preview: (choice: Choice) => ReactNode
  searchKeys: (keyof Choice)[]
  uniqueKey: keyof Choice
  sortKey: keyof Choice
  onSelect: (choice: Choice) => void
  onClose?: () => void
}

export function Selector<Choice>(props: SelectorProps<Choice>) {
  const options: Option<Choice>[] = props.choices.map((choice) => ({
    ...choice,
    value: String(choice[props.uniqueKey]),
  }))

  const ref = useRef<SelectBase<Choice>>(null)
  useEffect(() => {
    if (props?.onClose) ref.current?.focus()
  })

  return (
    <div style={{ position: 'absolute', left: `calc(${props.x})`, top: `calc(${props.y})`, zIndex: 10 }}>
      <Select
        options={sortOptions(options, props.sortKey, props.defaultId)}
        defaultValue={getDefault(options, props.defaultId)}
        isSearchable
        openMenuOnFocus={props.defaultId !== undefined}
        placeholder={props.placeholder}
        noOptionsMessage={() => props.empty}
        formatOptionLabel={props.preview}
        filterOption={(option, input) =>
          props.searchKeys
            .map((key) => option.data[key])
            .join('')
            .toLowerCase()
            .includes(input.toLowerCase())
        }
        styles={{
          control: (base) => ({
            ...base,
            width: props.width,
          }),
          menu: (base) => ({
            ...base,
            width: props.width,
          }),
        }}
        onChange={(option) => {
          if (option) {
            props.onSelect(option)
          }
          if (props?.onClose) props?.onClose()
        }}
        onMenuClose={() => {
          if (props?.onClose) props?.onClose()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            if (props?.onClose) props?.onClose()
          }
        }}
        ref={ref}
      />
    </div>
  )
}
