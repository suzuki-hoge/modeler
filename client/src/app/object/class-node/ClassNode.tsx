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

import { Handles } from '@/app/object/class-node/Handles'
import { NodeData } from '@/app/object/node'
import { selector, useStore } from '@/app/object/store'
import { WebSocketContext } from '@/app/socket/context'
import { sendAddMethodRequest } from '@/app/socket/message/add-method'
import { sendAddPropertyRequest } from '@/app/socket/message/add-property'
import { sendDeleteMethodRequest } from '@/app/socket/message/delete-method'
import { sendDeletePropertyRequest } from '@/app/socket/message/delete-property'
import { sendLockRequest } from '@/app/socket/message/lock'
import { sendUnlockRequest } from '@/app/socket/message/unlock'
import { sendUpdateIconRequest } from '@/app/socket/message/update-icon'
import { sendUpdateMethodRequest } from '@/app/socket/message/update-method'
import { sendUpdateNameRequest } from '@/app/socket/message/update-name'
import { sendUpdatePropertyRequest } from '@/app/socket/message/update-property'

import styles from './class-node.module.scss'

type Status = 'standard' | 'selected-by-me' | 'editing-by-me' | 'locked-by-someone'
function getStyle(status: Status): string {
  if (status === 'locked-by-someone') return `class-node ${styles.component} ${styles.locked}`
  else if (status === 'editing-by-me') return `class-node ${styles.component} ${styles.editing}`
  else if (status === 'selected-by-me') return `class-node ${styles.component} ${styles.selected}`
  else return `class-node ${styles.component}`
}

export interface Props {
  id: string
  data: NodeData
  selected: boolean
}

export const ClassNode = ({ id, data, selected }: Props) => {
  const [status, setStatus] = useState<Status>('standard')

  const [editing, setEditing] = useState(false)

  const { lockIds, unlock } = useStore(selector, shallow)

  const { send, socket } = useContext(WebSocketContext)!

  // status

  useEffect(() => {
    if (lockIds.has(id) && !selected) setStatus('locked-by-someone')
    else if (editing) setStatus('editing-by-me')
    else if (selected) setStatus('selected-by-me')
    else setStatus('standard')
  }, [id, lockIds, editing, selected])

  return (
    <div
      id={id}
      className={getStyle(status)}
      onClick={() => {
        // non input area clicked
        if (editing) {
          // from any input area
          setEditing(false)
          unlock([id])
          sendUnlockRequest(send, socket, [id])
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

  const { send, socket } = useContext(WebSocketContext)!

  const { lock, unlock } = useStore(selector, shallow)

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
            lock([props.id])
            sendLockRequest(send, socket, [props.id])
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
              sendUpdateIconRequest(send, socket, props.id, icon)
            }
            // fix
            props.setEditing(false)
            unlock([props.id])
            sendUnlockRequest(send, socket, [props.id])
            ref.current?.blur()
          }
        }}
        onBlur={() => {
          if (props.editing && icon !== props.icon) {
            sendUpdateIconRequest(send, socket, props.id, icon)
          }
          if (props.selected) {
            // continue editing ( click another input area or click non input area )
          } else {
            // leave focus
            props.setEditing(false)
            unlock([props.id])
            sendUnlockRequest(send, socket, [props.id])
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

  const { send, socket } = useContext(WebSocketContext)!

  const { lock, unlock } = useStore(selector, shallow)

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
          lock([props.id])
          sendLockRequest(send, socket, [props.id])
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
          unlock([props.id])
          sendUnlockRequest(send, socket, [props.id])
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
          unlock([props.id])
          sendUnlockRequest(send, socket, [props.id])
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
  const { send, socket } = useContext(WebSocketContext)!
  const f = (name: string) => sendUpdateNameRequest(send, socket, props.id, name)

  return <Text {...props} value={props.name} send={f} style={{ fontWeight: 'bold' }} />
}

const Property = (props: {
  id: string
  n: number
  property: string
  selected: boolean
  editing: boolean
  setEditing: Dispatch<SetStateAction<boolean>>
}) => {
  const { send, socket } = useContext(WebSocketContext)!
  const f = (property: string) => sendUpdatePropertyRequest(send, socket, props.id, property, props.n)

  return (
    <div className={styles.line}>
      <Text {...props} value={props.property} send={f} />
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
  const { send, socket } = useContext(WebSocketContext)!
  const f = (method: string) => sendUpdateMethodRequest(send, socket, props.id, method, props.n)

  return (
    <div className={styles.line}>
      <Text {...props} value={props.method} send={f} />
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
  const { addProperty, addMethod } = useStore(selector, shallow)

  const { send, socket } = useContext(WebSocketContext)!

  return (
    <MdAddCircleOutline
      className={styles.button}
      onClick={() => {
        if (props.type === 'property') {
          addProperty(props.id, props.n)
          sendAddPropertyRequest(send, socket, props.id, props.n)
        }
        if (props.type === 'method') {
          addMethod(props.id, props.n)
          sendAddMethodRequest(send, socket, props.id, props.n)
        }
      }}
    />
  )
}

const DeleteIcon = (props: { id: string; n: number; type: 'property' | 'method' }) => {
  const { deleteProperty, deleteMethod } = useStore(selector, shallow)

  const { send, socket } = useContext(WebSocketContext)!

  return (
    <AiOutlineDelete
      className={styles.button}
      onClick={() => {
        if (props.type === 'property') {
          deleteProperty(props.id, props.n)
          sendDeletePropertyRequest(send, socket, props.id, props.n)
        }
        if (props.type === 'method') {
          deleteMethod(props.id, props.n)
          sendDeleteMethodRequest(send, socket, props.id, props.n)
        }
      }}
    />
  )
}
