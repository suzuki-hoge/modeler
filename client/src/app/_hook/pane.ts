import React, { Dispatch, SetStateAction, useState } from 'react'

export interface SelectorState {
  active: boolean
  setActive: Dispatch<SetStateAction<boolean>>
  x: number
  setX: Dispatch<SetStateAction<number>>
  y: number
  setY: Dispatch<SetStateAction<number>>
}

export function useSelectorState(): SelectorState {
  const [active, setActive] = useState(false)
  const [x, setX] = useState(200)
  const [y, setY] = useState(200)

  return { active, setActive, x, setX, y, setY }
}

export function useOnPaneClick(selectorState: SelectorState): (event: React.MouseEvent<Element, MouseEvent>) => void {
  return (e) => {
    // Windows control or macOS Command
    if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
      selectorState.setActive(true)
      selectorState.setX(e.clientX)
      selectorState.setY(e.clientY)
    }
  }
}
