import { Dispatch, SetStateAction, useState } from 'react'

export interface PopupState {
  isEditing: boolean
  closed: number
}

export function usePopup(): {
  popupState: PopupState
  setPopupState: Dispatch<SetStateAction<PopupState>>
  openPopup: () => void
  closePopup: () => void
} {
  const [popupState, setPopupState] = useState({ isEditing: false, closed: 0 })

  return {
    popupState,
    setPopupState,
    openPopup: () =>
      setPopupState((prev) =>
        prev.closed + 100 < Date.now() ? { isEditing: true, closed: 0 } : { isEditing: false, closed: 0 },
      ),
    closePopup: () => setPopupState({ isEditing: false, closed: Date.now() }),
  }
}
