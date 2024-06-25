'use client'
import { Node, XYPosition } from 'reactflow'

import { IconText } from '@/app/_component/icon/icon-text/IconText'
import { CreatableSelector } from '@/app/_component/selector/CreatableSelector'
import { allocateNodeId, createProjectNode, getIcon } from '@/app/_object/node/function'
import { ProjectNodeData, NodeHeader, NodeIcon } from '@/app/_object/node/type'

interface Props {
  x: string
  y: string
  headers: NodeHeader[]
  defaultId?: string
  icons: NodeIcon[]
  newNodePos: XYPosition
  onSelect: (choice: NodeHeader, x: number, y: number) => void
  onPostNodeCreate: (projectNode: Node<ProjectNodeData>, x: number, y: number) => void
  onClose?: () => void
}

export const ClassCreatableSelector = (props: Props) => {
  return (
    <CreatableSelector
      x={props.x}
      y={props.y}
      width={`${12 + Math.max(...props.headers.map((header) => header.name.length))}ch`}
      placeholder={'class...'}
      empty={'no classes'}
      choices={props.headers}
      defaultId={props.defaultId}
      preview={(header) => {
        const icon = getIcon(header.iconId, props.icons)
        return <IconText preview={icon.preview} color={icon.color} desc={header.name} />
      }}
      searchKeys={['name']}
      uniqueKey={'id'}
      sortKey={'name'}
      onSelect={(header) => props.onSelect(header, props.newNodePos.x, props.newNodePos.y)}
      onCreate={(value) => {
        const node = createProjectNode(allocateNodeId(), value)
        props.onPostNodeCreate(node, props.newNodePos.x, props.newNodePos.y)
      }}
      onClose={props.onClose}
    />
  )
}
