'use client'

import { shallow } from 'zustand/shallow'

import { IconText } from '@/app/_component/icon/icon-text/IconText'
import { CreatableSelector } from '@/app/_component/selector/CreatableSelector'
import { getIcon } from '@/app/_object/node/function'
import { NodeHeader } from '@/app/_object/node/type'
import { useProjectStore } from '@/app/_store/project-store'

interface Props {
  x: string
  y: string
  defaultId?: string
  onCreate: (name: string) => void
  onSelect: (choice: NodeHeader) => void
  onClose?: () => void
}

export const ClassSelector = (props: Props) => {
  const headers = useProjectStore((state) => state.nodeHeaders, shallow)
  const icons = useProjectStore((state) => state.nodeIcons, shallow)

  return (
    <CreatableSelector
      x={props.x}
      y={props.y}
      width={`${12 + Math.max(...headers.map((header) => header.name.length))}ch`}
      placeholder={'class...'}
      empty={'no classes'}
      choices={headers}
      defaultId={props.defaultId}
      preview={(header) => {
        const icon = getIcon(header.iconId, icons)
        return <IconText preview={icon.preview} color={icon.color} desc={header.name} />
      }}
      searchKeys={['name']}
      uniqueKey={'id'}
      sortKey={'name'}
      onCreate={props.onCreate}
      onSelect={props.onSelect}
      onClose={props.onClose}
    />
  )
}
