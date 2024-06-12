'use client'

import React, { ReactNode, RefObject, useEffect, useRef } from 'react'
import SelectBase from 'react-select/base'
import CreatableSelect from 'react-select/creatable'

import { PopupState } from '@/app/_component/selector/Popup'

type Option<Choice> =
  | (Choice & {
      __isNew__: false
    })
  | {
      label: string
      value: string
      __isNew__: true
    }

export interface Props<Choice> {
  width: string
  placeholder: string
  choices: Choice[]
  preview: (choice: Choice) => ReactNode
  search: (keyof Choice)[]
  onSelect: (choice: Choice) => void
  onCreate: (value: string) => void
  popupState: PopupState
  closePopup: () => void
  focusBackRef?: RefObject<HTMLInputElement>
}

export function PopupCreatableSelector<Choice>(props: Props<Choice>) {
  const options: Option<Choice>[] = props.choices.map((choice) => ({ ...choice, __isNew__: false }))

  const ref = useRef<SelectBase<Option<Choice>>>(null)

  useEffect(() => {
    if (props.popupState) ref.current?.focus()
  }, [props.popupState])

  return (
    <CreatableSelect
      options={options}
      isSearchable
      placeholder={props.placeholder}
      formatOptionLabel={(option) => (option.__isNew__ ? <span>create {option.value}</span> : props.preview(option))}
      filterOption={(option, input) =>
        option.data.__isNew__ ||
        props.search
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
        props.closePopup()
        props.focusBackRef?.current?.focus()
      }}
      onMenuClose={() => {
        props.closePopup()
        props.focusBackRef?.current?.focus()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          props.closePopup()
          props.focusBackRef?.current?.focus()
        }
      }}
      ref={ref}
    />
  )
}
