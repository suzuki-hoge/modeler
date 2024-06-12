import React, { memo, ReactNode, useCallback, useContext, useEffect, useMemo } from 'react'
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
import { NodeData, NodeHeader, NodeIcon } from '@/app/_object/node/type'
import { SocketContext } from '@/app/_socket/socket'
import { selector, useStore } from '@/app/_store/store'

import styles from './class-node.module.scss'

interface Props {
  id: string
  data: NodeData
  selected: boolean
}

export const ClassNode = (props: Props) => {
  const store = useStore(selector, shallow)
  const socket = useContext(SocketContext)!

  const headers = useMemo(() => store.nodeHeaders, [store.nodeHeaders])
  const icons = useMemo(() => store.nodeIcons, [store.nodeIcons])

  const isSelected = props.selected
  useEffect(
    () => {
      if (isSelected) {
        socket.lock(props.id)
      } else {
        socket.unlock(props.id)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSelected],
  )
  const isLocked = store.isLocked(props.id)

  const onChangeName = useCallback(
    (name: string) => {
      store.updateNodeData(props.id, (data) => ({ ...data, name }))
      socket.updateName(props.id, name)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const onChangeIconId = useCallback(
    (iconId: string) => {
      store.updateNodeData(props.id, (data) => ({ ...data, iconId }))
      socket.updateIconId(props.id, iconId)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const onInsertProperties = useMemo(
    () =>
      props.data.properties.map((_, n) => () => {
        store.updateNodeData(props.id, (data) => insertProperty(data, '', n))
        socket.insertProperty(props.id, '', n)
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.data.properties],
  )
  const onUpdateProperties = useMemo(
    () =>
      props.data.properties.map((_, n) => (inner: string) => {
        store.updateNodeData(props.id, (data) => updateProperty(data, inner, n))
        socket.updateProperty(props.id, inner, n)
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.data.properties],
  )
  const onDeleteProperties = useMemo(
    () =>
      props.data.properties.map((_, n) => () => {
        store.updateNodeData(props.id, (data) => deleteProperty(data, n))
        socket.deleteProperty(props.id, n)
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.data.properties],
  )
  const onInsertFirstProperty = useCallback(
    () => {
      store.updateNodeData(props.id, (data) => insertProperty(data, '', 0))
      socket.insertProperty(props.id, '', 0)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const onInsertMethods = useMemo(
    () =>
      props.data.methods.map((_, n) => () => {
        store.updateNodeData(props.id, (data) => insertMethod(data, '', n))
        socket.insertMethod(props.id, '', n)
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.data.methods],
  )
  const onUpdateMethods = useMemo(
    () =>
      props.data.methods.map((_, n) => (inner: string) => {
        store.updateNodeData(props.id, (data) => updateMethod(data, inner, n))
        socket.updateMethod(props.id, inner, n)
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.data.methods],
  )
  const onDeleteMethods = useMemo(
    () =>
      props.data.methods.map((_, n) => () => {
        store.updateNodeData(props.id, (data) => deleteMethod(data, n))
        socket.deleteMethod(props.id, n)
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.data.methods],
  )
  const onInsertFirstMethod = useCallback(
    () => {
      store.updateNodeData(props.id, (data) => insertMethod(data, '', 0))
      socket.insertMethod(props.id, '', 0)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const onPostNodeCreate = useOnPostNodeCreate(store, socket, props.id)
  const onPostNodeSelect = useOnPostNodeSelect(store, socket, props.id)

  const handles = useMemo(() => <Handles />, [])

  return (
    <>
      <ClassNodeInner
        {...props}
        isSelected={isSelected}
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
      >
        {handles}
      </ClassNodeInner>
    </>
  )
}

interface InnerProps {
  id: string
  isSelected: boolean
  isLocked: boolean
  data: NodeData
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
  onPostNodeCreate: (node: Node<NodeData>) => void
  onPostNodeSelect: (header: NodeHeader) => void
  children: ReactNode
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
      {props.children}
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
  onPostNodeCreate: (node: Node<NodeData>) => void
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
  onPostNodeCreate: (node: Node<NodeData>) => void
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
