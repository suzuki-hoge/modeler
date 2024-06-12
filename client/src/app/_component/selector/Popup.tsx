'use client'

import React, { ReactElement, RefObject, useState } from 'react'

import { CreatableSelector, CreatableSelectorProps } from '@/app/_component/selector/CreatableSelector'
import { Selector, SelectorProps } from '@/app/_component/selector/Selector'

export interface PopupState {
  isEditing: boolean
  closed: number
}

export function usePopup(): {
  popupState: PopupState
  openPopup: () => void
  closePopup: () => void
} {
  const [popupState, setPopupState] = useState({ isEditing: false, closed: 0 })

  return {
    popupState,
    openPopup: () =>
      setPopupState((prev) =>
        prev.closed + 100 < Date.now() ? { isEditing: true, closed: 0 } : { isEditing: false, closed: 0 },
      ),
    closePopup: () => setPopupState({ isEditing: false, closed: Date.now() }),
  }
}

export interface Props<Choice> {
  popupState: PopupState
  closePopup: () => void
  focusBackRef?: RefObject<HTMLInputElement>
  children:
    | ReactElement<SelectorProps<Choice>, typeof Selector>
    | ReactElement<CreatableSelectorProps<Choice>, typeof CreatableSelector>
}

export function Popup<Choice>(props: Props<Choice>) {
  const onClose = () => {
    props.closePopup()
    props.focusBackRef?.current?.focus()
  }

  return props.popupState.isEditing ? React.cloneElement(props.children, { onClose }) : <></>
}
