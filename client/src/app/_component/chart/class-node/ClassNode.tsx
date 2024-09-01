import { Node, NodeProps, NodeTypes, XYPosition } from '@xyflow/react'
import React, { memo, useCallback, useMemo } from 'react'
import { shallow } from 'zustand/shallow'

import { Handles } from '@/app/_component/chart/class-node/Handles'
import { AddIcon } from '@/app/_component/icon/add-icon/AddIcon'
import { DeleteIcon } from '@/app/_component/icon/delete-icon/DeleteIcon'
import { ClassIcon } from '@/app/_component/input/class-icon/ClassIcon'
import { ClassName } from '@/app/_component/input/class-name/ClassName'
import { CompletableInput } from '@/app/_component/input/completable-input/CompletableInput'
import { deleteString, insertString, updateString } from '@/app/_flow/object/node/function'
import { NodeIcon, PageNodeData, ProjectNodeData } from '@/app/_flow/object/node/type'
import { projectSocketSelector, useProjectSocket } from '@/app/_flow/socket/project-socket'
import { pageStoreSelector, usePageStore } from '@/app/_flow/store/page-store'
import { projectStoreSelector, useProjectStore } from '@/app/_flow/store/project-store'

import styles from './class-node.module.scss'

export const ClassNode = (props: NodeProps<Node<PageNodeData>>) => {
  const projectStore = useProjectStore(projectStoreSelector, shallow)
  const pageStore = usePageStore(pageStoreSelector, shallow)

  const projectSocket = useProjectSocket(projectSocketSelector, shallow)

  const projectNode = projectStore.getNode(props.id)
  const data = useMemo(() => projectNode.data, [projectNode.data])

  const pageNode = pageStore.getNode(props.id)
  const newNodePositionBase = useMemo(
    () => ({
      x: pageNode.position.x,
      y: pageNode.position.y,
      distance: Math.max(pageNode.measured?.width || 0, pageNode.measured?.height || 0) + 32,
    }),
    [pageNode.position, pageNode.measured],
  )

  const icons = useProjectStore((state) => state.nodeIcons, shallow)

  const onChangeName = useCallback(
    (name: string) => {
      projectStore.updateNodeData(props.id, (data) => ({ ...data, name }))
      projectSocket.updateName(props.id, name)
      pageStore.modifyNode(props.id)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const onChangeIconId = useCallback(
    (iconId: string) => {
      projectStore.updateNodeData(props.id, (data) => ({ ...data, iconId }))
      projectSocket.updateIconId(props.id, iconId)
      pageStore.modifyNode(props.id)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const onChangeProperties = useCallback(
    (properties: string[]) => {
      projectStore.updateNodeData(props.id, (data) => ({ ...data, properties }))
      projectSocket.updateProperties(props.id, properties)
      pageStore.modifyNode(props.id)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const onChangeMethods = useCallback(
    (methods: string[]) => {
      projectStore.updateNodeData(props.id, (data) => ({ ...data, methods }))
      projectSocket.updateMethods(props.id, methods)
      pageStore.modifyNode(props.id)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return (
    <>
      <ClassNodeInner
        id={props.id}
        isSelected={props.selected || false}
        isNew={(props.data.created || Number.MAX_VALUE) < Date.now() + 1000}
        data={data}
        icons={icons}
        onChangeName={onChangeName}
        onChangeIconId={onChangeIconId}
        onChangeProperties={onChangeProperties}
        onChangeMethods={onChangeMethods}
        newNodePositionBase={newNodePositionBase}
      />
      <Handles visible={props.selected || false} icon={'simple'} />
    </>
  )
}

interface InnerProps {
  id: string
  isSelected: boolean
  isNew: boolean
  data: ProjectNodeData
  icons: NodeIcon[]
  onChangeName: (name: string) => void
  onChangeIconId: (iconId: string) => void
  onChangeProperties: (properties: string[]) => void
  onChangeMethods: (methods: string[]) => void
  newNodePositionBase: XYPosition & { distance: number }
}

export const ClassNodeInner = memo(function _ClassNodeInner(props: InnerProps) {
  const classNames = ['class-node', styles.component]
  if (props.isSelected) classNames.push(styles.selected)
  if (props.isNew) classNames.push(styles.new)

  return (
    <div id={props.id} className={classNames.join(' ')}>
      <Header
        iconId={props.data.iconId}
        icons={props.icons}
        name={props.data.name}
        onChangeName={props.onChangeName}
        onChangeIconId={props.onChangeIconId}
      />
      <hr />
      {props.data.properties.map((property, n) => (
        <Property
          key={n}
          isSelected={props.isSelected}
          inner={property}
          properties={props.data.properties}
          n={n}
          onChangeProperties={props.onChangeProperties}
          sourceNodeId={props.id}
          newNodePositionBase={props.newNodePositionBase}
        />
      ))}
      {props.data.properties.length === 0 && (
        <EmptyLine isSelected={props.isSelected} onInsert={() => props.onChangeProperties([''])} />
      )}
      <hr />
      {props.data.methods.map((method, n) => (
        <Method
          key={n}
          isSelected={props.isSelected}
          inner={method}
          methods={props.data.methods}
          n={n}
          onChangeMethods={props.onChangeMethods}
          sourceNodeId={props.id}
          newNodePositionBase={props.newNodePositionBase}
        />
      ))}
      {props.data.methods.length === 0 && (
        <EmptyLine isSelected={props.isSelected} onInsert={() => props.onChangeMethods([''])} />
      )}
    </div>
  )
})

interface HeaderProps {
  iconId: string
  icons: NodeIcon[]
  name: string
  onChangeName: (name: string) => void
  onChangeIconId: (iconId: string) => void
}

const Header = memo(function _Header(props: HeaderProps) {
  return (
    <div className={styles.header}>
      <ClassIcon
        iconId={props.iconId}
        icons={props.icons}
        readonly={false}
        onChange={(icon) => props.onChangeIconId(icon.id)}
      />
      <ClassName name={props.name} readonly={false} onChange={props.onChangeName} />
    </div>
  )
})

interface PropertyProps {
  isSelected: boolean
  inner: string
  properties: string[]
  n: number
  onChangeProperties: (properties: string[]) => void
  sourceNodeId: string
  newNodePositionBase: XYPosition & { distance: number }
}

const Property = memo(function _Property(props: PropertyProps) {
  return (
    <div className={styles.line}>
      <CompletableInput
        inner={props.inner}
        onTextChange={(inner) => props.onChangeProperties(updateString(props.properties, inner, props.n))}
        sourceNodeId={props.sourceNodeId}
        newNodePositionBase={props.newNodePositionBase}
      />
      <div className={props.isSelected ? styles.activeButtons : styles.inactiveButtons}>
        <AddIcon onClick={() => props.onChangeProperties(insertString(props.properties, '', props.n))} />
        <DeleteIcon onClick={() => props.onChangeProperties(deleteString(props.properties, props.n))} />
      </div>
    </div>
  )
})

interface MethodProps {
  isSelected: boolean
  inner: string
  methods: string[]
  n: number
  onChangeMethods: (methods: string[]) => void
  sourceNodeId: string
  newNodePositionBase: XYPosition & { distance: number }
}

const Method = memo(function _Method(props: MethodProps) {
  return (
    <div className={styles.line}>
      <CompletableInput
        inner={props.inner}
        onTextChange={(inner) => props.onChangeMethods(updateString(props.methods, inner, props.n))}
        sourceNodeId={props.sourceNodeId}
        newNodePositionBase={props.newNodePositionBase}
      />
      <div className={props.isSelected ? styles.activeButtons : styles.inactiveButtons}>
        <AddIcon onClick={() => props.onChangeMethods(insertString(props.methods, '', props.n))} />
        <DeleteIcon onClick={() => props.onChangeMethods(deleteString(props.methods, props.n))} />
      </div>
    </div>
  )
})

interface EmptyLineProps {
  isSelected: boolean
  onInsert: () => void
}

const EmptyLine = memo(function _EmptyLine(props: EmptyLineProps) {
  return (
    <div className={styles.line}>
      <div></div>
      <div className={props.isSelected ? styles.activeButtons : styles.inactiveButtons}>
        <AddIcon onClick={props.onInsert} />
      </div>
    </div>
  )
})

export const nodeTypes: NodeTypes = { class: ClassNode }
