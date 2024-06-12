'use client'

import React, { ReactNode, useEffect, useRef } from 'react'
import Select from 'react-select'
import SelectBase from 'react-select/base'

type Option<Choice> = Choice

export interface SelectorProps<Choice> {
  width: string
  placeholder: string
  choices: Choice[]
  preview: (choice: Choice) => ReactNode
  search: (keyof Choice)[]
  onSelect: (choice: Choice) => void
  onClose?: () => void
}

export function Selector<Choice>(props: SelectorProps<Choice>) {
  const options: Option<Choice>[] = props.choices

  const ref = useRef<SelectBase<Choice>>(null)
  useEffect(() => {
    if (props?.onClose) ref.current?.focus()
  })

  return (
    <Select
      options={options}
      isSearchable
      placeholder={props.placeholder}
      formatOptionLabel={props.preview}
      filterOption={(option, input) =>
        props.search
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
  )
}
