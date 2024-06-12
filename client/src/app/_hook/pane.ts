import React, { Dispatch, SetStateAction, useState } from 'react'

interface PaneClassCreatableSelectorState {
  active: boolean
  setActive: Dispatch<SetStateAction<boolean>>
  x: number
  y: number
}
type OnPaneClick = (event: React.MouseEvent<Element, MouseEvent>) => void

export function useOnPaneClick(): { onPaneClick: OnPaneClick } & PaneClassCreatableSelectorState {
  const [active, setActive] = useState(false)
  const [x, setX] = useState(200)
  const [y, setY] = useState(200)

  const onPaneClick: OnPaneClick = (e) => {
    // Windows control or macOS Command
    if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
      setActive(true)
      setX(e.clientX)
      setY(e.clientY)
    }
  }

  return { onPaneClick, active, setActive, x, y }
}
