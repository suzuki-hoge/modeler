'use client'
import { XYPosition } from '@xyflow/react'
import { MutableRefObject } from 'react'
import { shallow } from 'zustand/shallow'

import { ClassSelector } from '@/app/_component/input/class-selector/ClassSelector'
import {
  clickPaneOnCreate,
  clickPaneOnSelect,
  dragPaneOnCreate,
  dragPaneOnSelect,
} from '@/app/_component/input/class-selector/function'
import { DragSource } from '@/app/_flow/hook/edge'
import { pageSocketSelector, usePageSocket } from '@/app/_flow/socket/page-socket'
import { projectSocketSelector, useProjectSocket } from '@/app/_flow/socket/project-socket'
import { pageStoreSelector, usePageStore } from '@/app/_flow/store/page-store'
import { projectStoreSelector, useProjectStore } from '@/app/_flow/store/project-store'

interface Props {
  x: string
  y: string
  dragSource: MutableRefObject<DragSource | null>
  newNodePosition: XYPosition
  onClose: () => void
}

export const ClassSelectorOnPane = (props: Props) => {
  const projectStore = useProjectStore(projectStoreSelector, shallow)
  const pageStore = usePageStore(pageStoreSelector, shallow)

  const projectSocket = useProjectSocket(projectSocketSelector, shallow)
  const pageSocket = usePageSocket(pageSocketSelector, shallow)

  return (
    <ClassSelector
      x={props.x}
      y={props.y}
      onCreate={(name) => {
        if (props.dragSource.current) {
          dragPaneOnCreate(
            projectStore,
            projectSocket,
            pageStore,
            pageSocket,
            name,
            props.dragSource.current.id,
            props.newNodePosition,
          )

          // reset dragging
          props.dragSource.current = null
        } else {
          clickPaneOnCreate(projectStore, projectSocket, pageStore, pageSocket, name, props.newNodePosition)
        }
      }}
      onSelect={(header) => {
        if (props.dragSource.current) {
          dragPaneOnSelect(
            projectStore,
            projectSocket,
            pageStore,
            pageSocket,
            header,
            props.dragSource.current.id,
            props.newNodePosition,
          )

          // reset dragging
          props.dragSource.current = null
        } else {
          clickPaneOnSelect(pageStore, pageSocket, header, props.newNodePosition)
        }
      }}
      onClose={props.onClose}
    />
  )
}
