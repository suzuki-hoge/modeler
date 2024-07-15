'use client'

import React, { ReactNode, useEffect, useRef } from 'react'
import SelectBase from 'react-select/base'
import CreatableSelect from 'react-select/creatable'

import { getDefault, sortOptions } from '@/app/_component/selector/function'

type SelectOption<Choice> = Choice & {
  value: string
  __isNew__: false
}

interface CreateOption {
  label: string
  value: string
  __isNew__: true
}

type Option<Choice> = SelectOption<Choice> | CreateOption

export interface CreatableSelectorProps<Choice> {
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
  onCreate: (value: string) => void
  onClose?: () => void
}

export function CreatableSelector<Choice>(props: CreatableSelectorProps<Choice>) {
  const selectOptions: SelectOption<Choice>[] = props.choices.map((choice) => ({
    ...choice,
    value: String(choice[props.uniqueKey]),
    __isNew__: false,
  }))
  const options: Option<Choice>[] = sortOptions(selectOptions, props.sortKey, props.defaultId)

  const ref = useRef<SelectBase<Option<Choice>>>(null)
  useEffect(() => {
    if (props?.onClose) ref.current?.focus()
  })

  return (
    <div style={{ position: 'absolute', left: `calc(${props.x})`, top: `calc(${props.y})`, zIndex: 10 }}>
      <CreatableSelect
        options={options}
        defaultValue={getDefault(options, props.defaultId)}
        isSearchable
        openMenuOnFocus={props.defaultId !== undefined}
        placeholder={props.placeholder}
        noOptionsMessage={() => props.empty}
        formatOptionLabel={(option) => (option.__isNew__ ? <span>create {option.value}</span> : props.preview(option))}
        filterOption={(option, input) =>
          option.data.__isNew__ ||
          props.searchKeys
            .map((key) => !option.data.__isNew__ && option.data[key])
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
        onChange={(option, meta) => {
          if (meta.action === 'select-option' && option && !option.__isNew__) {
            props.onSelect(option)
          } else if (meta.action === 'create-option' && option && option.__isNew__) {
            props.onCreate(option.value)
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
