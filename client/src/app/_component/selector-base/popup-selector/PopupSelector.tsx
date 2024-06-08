'use client'

import React, { Dispatch, ReactNode, RefObject, SetStateAction, useEffect, useRef } from 'react'
import Select from 'react-select'
import SelectBase from 'react-select/base'

import { PopupState } from '@/app/_hook/popup'

type Option<Choice> = Choice

export interface Props<Choice> {
  width: string
  choices: Choice[]
  preview: (choice: Choice) => ReactNode
  search: (keyof Choice)[]
  onSelect: (choice: Choice) => void
  popupState: PopupState
  setPopupState: Dispatch<SetStateAction<PopupState>>
  closePopup: () => void
  focusBackRef?: RefObject<HTMLInputElement>
}

export function PopupSelector<Choice>(props: Props<Choice>) {
  const options: Option<Choice>[] = props.choices

  const ref = useRef<SelectBase<Choice>>(null)

  useEffect(() => {
    if (props.popupState) ref.current?.focus()
  }, [props.popupState])

  return props.popupState.isEditing ? (
    <Select
      options={options}
      isSearchable
      placeholder={'Select...'}
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
  ) : (
    <></>
  )
}
