'use client'
import { Node, XYPosition } from 'reactflow'

import { IconText } from '@/app/_component/icon/icon-text/IconText'
import { CreatableSelector } from '@/app/_component/selector/CreatableSelector'
import { allocateNodeId, createNode, getIcon } from '@/app/_object/node/function'
import { NodeData, NodeHeader, NodeIcon } from '@/app/_object/node/type'

interface Props {
  x: number
  y: number
  headers: NodeHeader[]
  icons: NodeIcon[]
  newNodePos: XYPosition
  onSelect: (choice: NodeHeader) => void
  onPostNodeCreate: (node: Node<NodeData>) => void
  onClose?: () => void
}

export const ClassCreatableSelector = (props: Props) => {
  return (
    <CreatableSelector
      x={props.x}
      y={props.y}
      width={`${8 + Math.max(...props.headers.map((header) => header.name.length))}ch`}
      placeholder={'class...'}
      choices={props.headers}
      preview={(header) => {
        const icon = getIcon(header.iconId, props.icons)
        return <IconText preview={icon.preview} color={icon.color} desc={header.name} />
      }}
      search={['name']}
      onSelect={props.onSelect}
      onCreate={(value) => {
        const { x, y } = props.newNodePos
        const node = createNode(allocateNodeId(), x, y, value)
        props.onPostNodeCreate(node)
      }}
      onClose={props.onClose}
    />
  )
}
