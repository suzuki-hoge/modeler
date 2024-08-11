import { useReactFlow, XYPosition } from '@xyflow/react'
import React, { Dispatch, SetStateAction, useState } from 'react'

export interface SelectorState {
  active: boolean
  setActive: Dispatch<SetStateAction<boolean>>
  position: { screen: XYPosition; flow: XYPosition }
  setPosition: Dispatch<SetStateAction<{ screen: XYPosition; flow: XYPosition }>>
}

export function useSelectorState(): SelectorState {
  const [active, setActive] = useState(false)
  const [position, setPosition] = useState({ screen: { x: 0, y: 0 }, flow: { x: 0, y: 0 } })

  return { active, setActive, position, setPosition }
}

export function useOnPaneClick(selectorState: SelectorState): (event: React.MouseEvent<Element, MouseEvent>) => void {
  const rf = useReactFlow()
  return (e) => {
    // Windows control or macOS Command
    if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
      const screen = { x: e.clientX, y: e.clientY }
      const flow = rf.screenToFlowPosition(screen)
      selectorState.setActive(true)
      selectorState.setPosition({ screen, flow })
    }
  }
}
