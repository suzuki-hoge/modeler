import React, { memo, useCallback, useContext, useEffect, useMemo } from 'react'
import { Node, NodeTypes } from 'reactflow'
import { shallow } from 'zustand/shallow'

import { Handles } from '@/app/_component/chart/class-node/Handles'
import { AddIcon } from '@/app/_component/icon/add-icon/AddIcon'
import { DeleteIcon } from '@/app/_component/icon/delete-icon/DeleteIcon'
import { ClassIcon } from '@/app/_component/input/class-icon/ClassIcon'
import { ClassName } from '@/app/_component/input/class-name/ClassName'
import { CompletableInput } from '@/app/_component/input/completable-input/CompletableInput'
import { useOnPostNodeCreate, useOnPostNodeSelect } from '@/app/_hook/node'
import {
  deleteMethod,
  deleteProperty,
  insertMethod,
  insertProperty,
  updateMethod,
  updateProperty,
} from '@/app/_object/node/function'
import { NodeHeader, NodeIcon, ProjectNodeData } from '@/app/_object/node/type'
import { PageSocketContext } from '@/app/_socket/page-socket'
import { ProjectSocketContext } from '@/app/_socket/project-socket'
import { pageSelector, usePageStore } from '@/app/_store/page-store'
import { projectSelector, useProjectStore } from '@/app/_store/project-store'

import styles from './class-node.module.scss'

interface Props {
  id: string
  selected: boolean
}

export const ClassNode = (props: Props) => {
  const projectStore = useProjectStore(projectSelector, shallow)
  const pageStore = usePageStore(pageSelector, shallow)
  const projectSocket = useContext(ProjectSocketContext)!
  const pageSocket = useContext(PageSocketContext)!

  const node = projectStore.getNode(props.id)

  const headers = useMemo(() => projectStore.nodeHeaders, [projectStore.nodeHeaders])
  const icons = useMemo(() => projectStore.nodeIcons, [projectStore.nodeIcons])

  useEffect(
    () => {
      if (props.selected) {
        pageSocket.lock(props.id)
      } else {
        pageSocket.unlock(props.id)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.selected],
  )
  const isLocked = pageStore.isLocked(props.id)

  const onChangeName = useCallback(
    (name: string) => {
      projectStore.updateNodeData(props.id, (data) => ({ ...data, name }))
      projectSocket.updateName(props.id, name)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const onChangeIconId = useCallback(
    (iconId: string) => {
      projectStore.updateNodeData(props.id, (data) => ({ ...data, iconId }))
      projectSocket.updateIconId(props.id, iconId)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const onInsertProperties = useMemo(
    () =>
      node.data.properties.map((_, n) => () => {
        projectStore.updateNodeData(props.id, (data) => insertProperty(data, '', n))
        projectSocket.insertProperty(props.id, '', n)
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [node.data.properties],
  )
  const onUpdateProperties = useMemo(
    () =>
      node.data.properties.map((_, n) => (inner: string) => {
        projectStore.updateNodeData(props.id, (data) => updateProperty(data, inner, n))
        projectSocket.updateProperty(props.id, inner, n)
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [node.data.properties],
  )
  const onDeleteProperties = useMemo(
    () =>
      node.data.properties.map((_, n) => () => {
        projectStore.updateNodeData(props.id, (data) => deleteProperty(data, n))
        projectSocket.deleteProperty(props.id, n)
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [node.data.properties],
  )
  const onInsertFirstProperty = useCallback(
    () => {
      projectStore.updateNodeData(props.id, (data) => insertProperty(data, '', 0))
      projectSocket.insertProperty(props.id, '', 0)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const onInsertMethods = useMemo(
    () =>
      node.data.methods.map((_, n) => () => {
        projectStore.updateNodeData(props.id, (data) => insertMethod(data, '', n))
        projectSocket.insertMethod(props.id, '', n)
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [node.data.methods],
  )
  const onUpdateMethods = useMemo(
    () =>
      node.data.methods.map((_, n) => (inner: string) => {
        projectStore.updateNodeData(props.id, (data) => updateMethod(data, inner, n))
        projectSocket.updateMethod(props.id, inner, n)
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [node.data.methods],
  )
  const onDeleteMethods = useMemo(
    () =>
      node.data.methods.map((_, n) => () => {
        projectStore.updateNodeData(props.id, (data) => deleteMethod(data, n))
        projectSocket.deleteMethod(props.id, n)
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [node.data.methods],
  )
  const onInsertFirstMethod = useCallback(
    () => {
      projectStore.updateNodeData(props.id, (data) => insertMethod(data, '', 0))
      projectSocket.insertMethod(props.id, '', 0)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const onPostNodeCreate = useOnPostNodeCreate(
    projectStore,
    projectSocket,
    pageStore,
    pageSocket,
    { id: props.id, arrowType: 'simple' },
    () => {},
  )
  const onPostNodeSelect = useOnPostNodeSelect(
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
        data={node.data}
        isSelected={props.selected}
        isLocked={isLocked}
        headers={headers}
        icons={icons}
        onChangeName={onChangeName}
        onChangeIconId={onChangeIconId}
        onInsertProperties={onInsertProperties}
        onUpdateProperties={onUpdateProperties}
        onDeleteProperties={onDeleteProperties}
        onInsertFirstProperty={onInsertFirstProperty}
        onInsertMethods={onInsertMethods}
        onUpdateMethods={onUpdateMethods}
        onDeleteMethods={onDeleteMethods}
        onInsertFirstMethod={onInsertFirstMethod}
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
  isLocked: boolean
  data: ProjectNodeData
  headers: NodeHeader[]
  icons: NodeIcon[]
  onChangeName: (name: string) => void
  onChangeIconId: (iconId: string) => void
  onInsertProperties: Array<() => void>
  onUpdateProperties: Array<(inner: string) => void>
  onDeleteProperties: Array<() => void>
  onInsertFirstProperty: () => void
  onInsertMethods: Array<() => void>
  onUpdateMethods: Array<(inner: string) => void>
  onDeleteMethods: Array<() => void>
  onInsertFirstMethod: () => void
  onPostNodeCreate: (node: Node<ProjectNodeData>) => void
  onPostNodeSelect: (header: NodeHeader) => void
}

export const ClassNodeInner = memo(function _ClassNodeInner(props: InnerProps) {
  const classNames = ['class-node', styles.component]
  if (props.isSelected) classNames.push(styles.selected)
  if (props.isLocked) classNames.push(styles.locked)

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
      {props.data.properties.map((property, i) => (
        <Property
          key={i}
          inner={property}
          headers={props.headers}
          icons={props.icons}
          onInsertProperty={props.onInsertProperties[i]}
          onUpdateProperty={props.onUpdateProperties[i]}
          onDeleteProperty={props.onDeleteProperties[i]}
          onPostNodeCreate={props.onPostNodeCreate}
          onPostNodeSelect={props.onPostNodeSelect}
        />
      ))}
      {props.data.properties.length === 0 && <EmptyLine onInsert={props.onInsertFirstProperty} />}
      <hr />
      {props.data.methods.map((method, i) => (
        <Method
          key={i}
          inner={method}
          headers={props.headers}
          icons={props.icons}
          onInsertMethod={props.onInsertMethods[i]}
          onUpdateMethod={props.onUpdateMethods[i]}
          onDeleteMethod={props.onDeleteMethods[i]}
          onPostNodeCreate={props.onPostNodeCreate}
          onPostNodeSelect={props.onPostNodeSelect}
        />
      ))}
      {props.data.methods.length === 0 && <EmptyLine onInsert={props.onInsertFirstMethod} />}
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
  inner: string
  headers: NodeHeader[]
  icons: NodeIcon[]
  onInsertProperty: () => void
  onUpdateProperty: (inner: string) => void
  onDeleteProperty: () => void
  onPostNodeCreate: (node: Node<ProjectNodeData>) => void
  onPostNodeSelect: (header: NodeHeader) => void
}

const Property = memo(function _Property(props: PropertyProps) {
  return (
    <div className={styles.line}>
      <CompletableInput
        inner={props.inner}
        headers={props.headers}
        icons={props.icons}
        readonly={false}
        onTextChange={props.onUpdateProperty}
        onPostNodeCreate={props.onPostNodeCreate}
        onPostNodeSelect={props.onPostNodeSelect}
      />
      <div className={styles.buttons}>
        <AddIcon onClick={props.onInsertProperty} />
        <DeleteIcon onClick={props.onDeleteProperty} />
      </div>
    </div>
  )
})

interface MethodProps {
  inner: string
  headers: NodeHeader[]
  icons: NodeIcon[]
  onInsertMethod: () => void
  onUpdateMethod: (inner: string) => void
  onDeleteMethod: () => void
  onPostNodeCreate: (node: Node<ProjectNodeData>) => void
  onPostNodeSelect: (header: NodeHeader) => void
}

const Method = memo(function _Method(props: MethodProps) {
  return (
    <div className={styles.line}>
      <CompletableInput
        inner={props.inner}
        headers={props.headers}
        icons={props.icons}
        readonly={false}
        onTextChange={props.onUpdateMethod}
        onPostNodeCreate={props.onPostNodeCreate}
        onPostNodeSelect={props.onPostNodeSelect}
      />
      <div className={styles.buttons}>
        <AddIcon onClick={props.onInsertMethod} />
        <DeleteIcon onClick={props.onDeleteMethod} />
      </div>
    </div>
  )
})

interface EmptyLineProps {
  onInsert: () => void
}

const EmptyLine = memo(function _EmptyLine(props: EmptyLineProps) {
  return (
    <div className={styles.line}>
      <div></div>
      <div className={styles.buttons}>
        <AddIcon onClick={props.onInsert} />
      </div>
    </div>
  )
})

export const nodeTypes: NodeTypes = { class: ClassNode }
