'use client'

import { Node, XYPosition } from '@xyflow/react'
import { shallow } from 'zustand/shallow'

import { ClassSelector } from '@/app/_component/input/class-selector/ClassSelector'
import {
  changeTextInReflectModeOnCreate,
  changeTextInReflectModeOnSelect,
  changeTextOnCreate,
  changeTextOnSelect,
} from '@/app/_component/input/class-selector/function'
import { NodeHeader, ProjectNodeData } from '@/app/_object/node/type'
import { pageSocketSelector, usePageSocket } from '@/app/_socket/page-socket'
import { projectSocketSelector, useProjectSocket } from '@/app/_socket/project-socket'
import { pageStoreSelector, usePageStore } from '@/app/_store/page-store'
import { projectStoreSelector, useProjectStore } from '@/app/_store/project-store'
import { userStoreSelector, useUserStore } from '@/app/_store/user-store'

interface Props {
  x: string
  y: string
  defaultId: string
  sourceNodeId: string
  newNodePositionBase: XYPosition & { distance: number }
  onPostCreate: (projectNode: Node<ProjectNodeData>) => void
  onPostSelect: (choice: NodeHeader) => void
  onClose: () => void
}

export const ClassSelectorInText = (props: Props) => {
  const userStore = useUserStore(userStoreSelector, shallow)
  const projectStore = useProjectStore(projectStoreSelector, shallow)
  const pageStore = usePageStore(pageStoreSelector, shallow)

  const projectSocket = useProjectSocket(projectSocketSelector, shallow)
  const pageSocket = usePageSocket(pageSocketSelector, shallow)

  const reflectPageObject = userStore.config.reflectPageObjectOnTextInput

  return (
    <ClassSelector
      x={props.x}
      y={props.y}
      defaultId={props.defaultId}
      onCreate={(name) => {
        if (reflectPageObject) {
          const projectNode = changeTextInReflectModeOnCreate(
            projectStore,
            projectSocket,
            pageStore,
            pageSocket,
            name,
            props.sourceNodeId,
            around(props.newNodePositionBase),
          )
          props.onPostCreate(projectNode)
        } else {
          const projectNode = changeTextOnCreate(projectStore, projectSocket, name, props.sourceNodeId)
          props.onPostCreate(projectNode)
        }
      }}
      onSelect={(header) => {
        if (reflectPageObject) {
          changeTextInReflectModeOnSelect(
            projectStore,
            projectSocket,
            pageStore,
            pageSocket,
            header,
            props.sourceNodeId,
            around(props.newNodePositionBase),
          )
          props.onPostSelect(header)
        } else {
          changeTextOnSelect(projectStore, projectSocket, header, props.sourceNodeId)
          props.onPostSelect(header)
        }
      }}
      onClose={props.onClose}
    />
  )
}

function around(base: XYPosition & { distance: number }): XYPosition {
  const angle = Math.random() * 2 * Math.PI

  return { x: base.x + base.distance * Math.cos(angle), y: base.y + base.distance * Math.sin(angle) }
}
