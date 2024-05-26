import { Set } from 'immutable'
import React, {
  CSSProperties,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { AiOutlineDelete } from 'react-icons/ai'
import { MdAddCircleOutline } from 'react-icons/md'
import { shallow } from 'zustand/shallow'

import { Handles } from '@/app/component/class-node/Handles'
import { deleteMethod, deleteProperty, insertMethod, insertProperty } from '@/app/object/node/function'
import { NodeData } from '@/app/object/node/type'
import { lock, unlock } from '@/app/object/state/lock'
import { selector, useStore } from '@/app/object/store'
import { SocketContext } from '@/app/socket/socket'

import styles from './class-node.module.scss'

type Status = 'standard' | 'selected-by-me' | 'editing-by-me' | 'locked-by-someone'
function getStyle(status: Status): string {
  if (status === 'locked-by-someone') return `class-node ${styles.component} ${styles.locked}`
  else if (status === 'editing-by-me') return `class-node ${styles.component} ${styles.editing}`
  else if (status === 'selected-by-me') return `class-node ${styles.component} ${styles.selected}`
  else return `class-node ${styles.component}`
}

interface Props {
  id: string
  data: NodeData
  selected: boolean
}

export const ClassNode = ({ id, data, selected }: Props) => {
  const [status, setStatus] = useState<Status>('standard')

  const [editing, setEditing] = useState(false)

  // fixme
  const { lockIds } = useStore(selector, shallow)

  // status

  useEffect(() => {
    if (lockIds.has(id) && !selected) setStatus('locked-by-someone')
    else if (editing) setStatus('editing-by-me')
    else if (selected) setStatus('selected-by-me')
    else setStatus('standard')
  }, [id, lockIds, editing, selected])

  const store = useStore(selector, shallow)
  const socket = useContext(SocketContext)!

  return (
    <div
      id={id}
      className={getStyle(status)}
      onClick={() => {
        // non input area clicked
        if (editing) {
          // from any input area
          setEditing(false)
          socket.unlock(Set(id))
          store.updateLockIds(unlock([id], store.lockIds))
        }
      }}
    >
      <div className={styles.header}>
        <Icon id={id} icon={data.icon} selected={selected} editing={editing} setEditing={setEditing} />
        <Name id={id} name={data.name} selected={selected} editing={editing} setEditing={setEditing} />
      </div>

      <hr />

      {data.properties.length !== 0 ? (
        <div className={styles.properties}>
          {data.properties.map((property, i) => (
            <Property
              key={i}
              id={id}
              n={i}
              property={property}
              selected={selected}
              editing={editing}
              setEditing={setEditing}
            />
          ))}
        </div>
      ) : (
        <Empty id={id} type={'property'} />
      )}

      <hr />

      {data.methods.length !== 0 ? (
        <div className={styles.methods}>
          {data.methods.map((method, i) => (
            <Method
              key={i}
              id={id}
              n={i}
              method={method}
              selected={selected}
              editing={editing}
              setEditing={setEditing}
            />
          ))}
        </div>
      ) : (
        <Empty id={id} type={'method'} />
      )}
      <Handles />
    </div>
  )
}

function getColor(s: string): string {
  if (s === 'S') {
    return '#c5def5'
  } else if (s === 'C') {
    return '#fef2c0'
  } else if (s === 'DC') {
    return '#c2e0c6'
  } else {
    return '#ffffff'
  }
}

const Icon = (props: {
  id: string
  icon: string
  selected: boolean
  editing: boolean
  setEditing: Dispatch<SetStateAction<boolean>>
}) => {
  const [icon, setIcon] = useState(props.icon)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => setIcon(props.icon), [props.icon])

  const store = useStore(selector, shallow)
  const socket = useContext(SocketContext)!

  return (
    <>
      <input
        type={'text'}
        className={styles.icon}
        style={{ backgroundColor: getColor(icon) }}
        value={icon}
        maxLength={2}
        ref={ref}
        onClick={(e) => {
          if (!props.editing) {
            // start editing
            props.setEditing(true)
            socket.lock(Set(props.id))
            store.updateLockIds(lock([props.id], store.lockIds))
          } else {
            // continue editing
          }
          e.stopPropagation()
        }}
        onChange={(e) => setIcon(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' || e.key === 'Enter') {
            if (icon !== props.icon) {
              // changed
              socket.updateIcon(props.id, icon)
            }
            // fix
            props.setEditing(false)
            socket.unlock(Set(props.id))
            store.updateLockIds(unlock([props.id], store.lockIds))
            ref.current?.blur()
          }
        }}
        onBlur={() => {
          if (props.editing && icon !== props.icon) {
            socket.updateIcon(props.id, icon)
          }
          if (props.selected) {
            // continue editing ( click another input area or click non input area )
          } else {
            // leave focus
            props.setEditing(false)
            socket.unlock(Set(props.id))
            store.updateLockIds(unlock([props.id], store.lockIds))
          }
        }}
      />
    </>
  )
}

const Text = (props: {
  id: string
  value: string
  selected: boolean
  send: (value: string) => void
  editing: boolean
  setEditing: Dispatch<SetStateAction<boolean>>
  style?: CSSProperties | undefined
}) => {
  const [value, setValue] = useState(props.value)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => setValue(props.value), [props.value])

  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.style.width = value.length !== 0 ? `${value.length * 0.5}rem` : '3rem'
    }
  }, [value.length])

  const store = useStore(selector, shallow)
  const socket = useContext(SocketContext)!

  return (
    <input
      type={'text'}
      className={styles.input}
      style={props.style}
      value={value}
      ref={ref}
      onClick={(e) => {
        if (!props.editing) {
          // start editing
          props.setEditing(true)
          socket.lock(Set(props.id))
          store.updateLockIds(lock([props.id], store.lockIds))
        } else {
          // continue editing
        }
        e.stopPropagation()
      }}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Escape' || e.key === 'Enter') {
          if (value !== props.value) {
            // changed
            props.send(value)
          }
          // fix
          props.setEditing(false)
          socket.unlock(Set(props.id))
          store.updateLockIds(unlock([props.id], store.lockIds))
          ref.current?.blur()
        }
      }}
      onBlur={() => {
        if (props.editing && value !== props.value) {
          props.send(value)
        }
        if (props.selected) {
          // continue editing ( click another input area or click non input area )
        } else {
          // leave focus
          props.setEditing(false)
          socket.unlock(Set(props.id))
          store.updateLockIds(unlock([props.id], store.lockIds))
        }
      }}
    />
  )
}

const Name = (props: {
  id: string
  name: string
  selected: boolean
  editing: boolean
  setEditing: Dispatch<SetStateAction<boolean>>
}) => {
  const socket = useContext(SocketContext)!
  return (
    <Text
      {...props}
      value={props.name}
      send={(value) => socket.updateName(props.id, value)}
      style={{ fontWeight: 600 }}
    />
  )
}

const Property = (props: {
  id: string
  n: number
  property: string
  selected: boolean
  editing: boolean
  setEditing: Dispatch<SetStateAction<boolean>>
}) => {
  const socket = useContext(SocketContext)!

  return (
    <div className={styles.line}>
      <Text {...props} value={props.property} send={(value) => socket.updateProperty(props.id, value, props.n)} />
      <div>
        <DeleteIcon {...props} type={'property'} />
        <AddIcon {...props} type={'property'} />
      </div>
    </div>
  )
}

const Method = (props: {
  id: string
  n: number
  method: string
  selected: boolean
  editing: boolean
  setEditing: Dispatch<SetStateAction<boolean>>
}) => {
  const socket = useContext(SocketContext)!

  return (
    <div className={styles.line}>
      <Text {...props} value={props.method} send={(value) => socket.updateMethod(props.id, value, props.n)} />
      <div>
        <DeleteIcon {...props} type={'method'} />
        <AddIcon {...props} type={'method'} />
      </div>
    </div>
  )
}

const Empty = (props: { id: string; type: 'property' | 'method' }) => {
  return (
    <div className={styles.line}>
      <div></div>
      <AddIcon {...props} n={0} />
    </div>
  )
}

const AddIcon = (props: { id: string; n: number; type: 'property' | 'method' }) => {
  const store = useStore(selector, shallow)
  const socket = useContext(SocketContext)!

  return (
    <MdAddCircleOutline
      className={styles.button}
      onClick={() => {
        if (props.type === 'property') {
          store.updateNodeData(props.id, (data) => insertProperty(data, '', props.n))
          socket.insertProperty(props.id, '', props.n)
        }
        if (props.type === 'method') {
          store.updateNodeData(props.id, (data) => insertMethod(data, '', props.n))
          socket.insertMethod(props.id, '', props.n)
        }
      }}
    />
  )
}

const DeleteIcon = (props: { id: string; n: number; type: 'property' | 'method' }) => {
  const store = useStore(selector, shallow)
  const socket = useContext(SocketContext)!

  return (
    <AiOutlineDelete
      className={styles.button}
      onClick={() => {
        if (props.type === 'property') {
          store.updateNodeData(props.id, (data) => deleteProperty(data, props.n))
          socket.deleteProperty(props.id, props.n)
        }
        if (props.type === 'method') {
          store.updateNodeData(props.id, (data) => deleteMethod(data, props.n))
          socket.deleteMethod(props.id, props.n)
        }
      }}
    />
  )
}
