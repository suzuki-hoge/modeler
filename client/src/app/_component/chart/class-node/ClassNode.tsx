import React, { memo, useCallback, useMemo } from 'react'
import { Node, NodeTypes, XYPosition } from 'reactflow'
import { shallow } from 'zustand/shallow'

import { Handles } from '@/app/_component/chart/class-node/Handles'
import { AddIcon } from '@/app/_component/icon/add-icon/AddIcon'
import { DeleteIcon } from '@/app/_component/icon/delete-icon/DeleteIcon'
import { ClassIcon } from '@/app/_component/input/class-icon/ClassIcon'
import { ClassName } from '@/app/_component/input/class-name/ClassName'
import { CompletableInput } from '@/app/_component/input/completable-input/CompletableInput'
import { createOnPostNodeCreate, createOnPostNodeSelect } from '@/app/_hook/node'
import { deleteString, insertString, updateString } from '@/app/_object/node/function'
import { NodeHeader, NodeIcon, ProjectNodeData } from '@/app/_object/node/type'
import { pageSocketSelector, usePageSocket } from '@/app/_socket/page-socket'
import { projectSocketSelector, useProjectSocket } from '@/app/_socket/project-socket'
import { pageStoreSelector, usePageStore } from '@/app/_store/page-store'
import { projectStoreSelector, useProjectStore } from '@/app/_store/project-store'

import styles from './class-node.module.scss'

interface Props {
  id: string
  selected: boolean
}

export const ClassNode = (props: Props) => {
  const projectStore = useProjectStore(projectStoreSelector, shallow)
  const pageStore = usePageStore(pageStoreSelector, shallow)
  const projectSocket = useProjectSocket(projectSocketSelector, shallow)
  const pageSocket = usePageSocket(pageSocketSelector, shallow)

  const projectNode = projectStore.getNode(props.id)
  const pageNode = pageStore.getNode(props.id)

  const headers = useMemo(() => projectStore.nodeHeaders, [projectStore.nodeHeaders])
  const icons = useMemo(() => projectStore.nodeIcons, [projectStore.nodeIcons])

  const newNodePosition = useMemo(
    () => ({ x: pageNode.position.x, y: pageNode.position.y + (pageNode.height || 0) + 30 }),
    [pageNode.position, pageNode.height],
  )

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
  const onPostNodeCreate = createOnPostNodeCreate(
    projectStore,
    projectSocket,
    pageStore,
    pageSocket,
    { id: props.id, arrowType: 'simple' },
    () => {},
  )
  const onPostNodeSelect = createOnPostNodeSelect(
    projectStore,
    projectSocket,
    pageStore,
    pageSocket,
    { id: props.id, arrowType: 'simple' },
    () => {},
  )

  return (
    <>
      <ClassNodeInner
        id={props.id}
        isSelected={props.selected}
        data={projectNode.data}
        headers={headers}
        icons={icons}
        onChangeName={onChangeName}
        onChangeIconId={onChangeIconId}
        onChangeProperties={onChangeProperties}
        onChangeMethods={onChangeMethods}
        newNodePosition={newNodePosition}
        onPostNodeCreate={onPostNodeCreate}
        onPostNodeSelect={onPostNodeSelect}
      />
      <Handles visible={props.selected} icon={'simple'} />
    </>
  )
}

interface InnerProps {
  id: string
  isSelected: boolean
  data: ProjectNodeData
  headers: NodeHeader[]
  icons: NodeIcon[]
  onChangeName: (name: string) => void
  onChangeIconId: (iconId: string) => void
  onChangeProperties: (properties: string[]) => void
  onChangeMethods: (methods: string[]) => void
  newNodePosition: XYPosition
  onPostNodeCreate: (node: Node<ProjectNodeData>, position: XYPosition) => void
  onPostNodeSelect: (header: NodeHeader, position: XYPosition) => void
}

export const ClassNodeInner = memo(function _ClassNodeInner(props: InnerProps) {
  const classNames = ['class-node', styles.component]
  if (props.isSelected) classNames.push(styles.selected)

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
          headers={props.headers}
          icons={props.icons}
          properties={props.data.properties}
          n={n}
          onChangeProperties={props.onChangeProperties}
          newNodePosition={props.newNodePosition}
          onPostNodeCreate={props.onPostNodeCreate}
          onPostNodeSelect={props.onPostNodeSelect}
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
          headers={props.headers}
          icons={props.icons}
          methods={props.data.methods}
          n={n}
          onChangeMethods={props.onChangeMethods}
          newNodePosition={props.newNodePosition}
          onPostNodeCreate={props.onPostNodeCreate}
          onPostNodeSelect={props.onPostNodeSelect}
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
  headers: NodeHeader[]
  icons: NodeIcon[]
  properties: string[]
  n: number
  onChangeProperties: (properties: string[]) => void
  newNodePosition: XYPosition
  onPostNodeCreate: (node: Node<ProjectNodeData>, position: XYPosition) => void
  onPostNodeSelect: (header: NodeHeader, position: XYPosition) => void
}

const Property = memo(function _Property(props: PropertyProps) {
  return (
    <div className={styles.line}>
      <CompletableInput
        inner={props.inner}
        headers={props.headers}
        icons={props.icons}
        readonly={false}
        onTextChange={(inner) => props.onChangeProperties(updateString(props.properties, inner, props.n))}
        newNodePosition={props.newNodePosition}
        onPostNodeCreate={props.onPostNodeCreate}
        onPostNodeSelect={props.onPostNodeSelect}
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
  headers: NodeHeader[]
  icons: NodeIcon[]
  methods: string[]
  n: number
  onChangeMethods: (methods: string[]) => void
  newNodePosition: XYPosition
  onPostNodeCreate: (node: Node<ProjectNodeData>, position: XYPosition) => void
  onPostNodeSelect: (header: NodeHeader, position: XYPosition) => void
}

const Method = memo(function _Method(props: MethodProps) {
  return (
    <div className={styles.line}>
      <CompletableInput
        inner={props.inner}
        headers={props.headers}
        icons={props.icons}
        readonly={false}
        onTextChange={(inner) => props.onChangeMethods(updateString(props.methods, inner, props.n))}
        newNodePosition={props.newNodePosition}
        onPostNodeCreate={props.onPostNodeCreate}
        onPostNodeSelect={props.onPostNodeSelect}
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
