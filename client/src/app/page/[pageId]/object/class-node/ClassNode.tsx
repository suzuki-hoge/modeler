import React, { CSSProperties, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AiOutlineDelete } from 'react-icons/ai'
import { MdAddCircleOutline } from 'react-icons/md'
import { Handle, Position } from 'reactflow'
import { shallow } from 'zustand/shallow'

import { WebSocketContext } from '@/app/page/[pageId]/context'
import { sendAddMethodRequest } from '@/app/page/[pageId]/message/add-method'
import { sendAddPropertyRequest } from '@/app/page/[pageId]/message/add-property'
import { sendDeleteMethodRequest } from '@/app/page/[pageId]/message/delete-method'
import { sendDeletePropertyRequest } from '@/app/page/[pageId]/message/delete-property'
import { sendLockRequest } from '@/app/page/[pageId]/message/lock'
import { sendUnlockRequest } from '@/app/page/[pageId]/message/unlock'
import { sendUpdateIconRequest } from '@/app/page/[pageId]/message/update-icon'
import { sendUpdateMethodRequest } from '@/app/page/[pageId]/message/update-method'
import { sendUpdateNameRequest } from '@/app/page/[pageId]/message/update-name'
import { sendUpdatePropertyRequest } from '@/app/page/[pageId]/message/update-property'
import { NodeData } from '@/app/page/[pageId]/object/node'
import { selector, useStore } from '@/app/page/[pageId]/object/store'

import styles from './class-node.module.scss'

export interface Props {
  id: string
  data: NodeData
  selected: boolean
}

export const ClassNode = ({ id, data, selected }: Props) => {
  const { lockIds } = useStore(selector, shallow)
  const locked = lockIds.includes(id) && !selected

  return (
    <div className={styles.component} style={{ backgroundColor: locked ? '#eeeeee' : 'lightyellow' }}>
      <div className={styles.header}>
        <Icon id={id} icon={data.icon} />
        <Name id={id} name={data.name} />
      </div>

      <hr />

      {data.properties.length !== 0 ? (
        <div className={styles.properties}>
          {data.properties.map((property, i) => (
            <Property key={i} id={id} n={i} property={property} />
          ))}
        </div>
      ) : (
        <Empty id={id} type={'property'} />
      )}

      <hr />

      {data.methods.length !== 0 ? (
        <div className={styles.methods}>
          {data.methods.map((method, i) => (
            <Method key={i} id={id} n={i} method={method} />
          ))}
        </div>
      ) : (
        <Empty id={id} type={'method'} />
      )}
      <Handle type='target' position={Position.Top} />
      <Handle type='source' position={Position.Bottom} />
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

const Icon = (props: { id: string; icon: string }) => {
  let editing = false
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
        onClick={() => {
          editing = true
          lock(props.id)
          sendLockRequest(send, socket, props.id)
        }}
        onChange={(e) => {
          setIcon(e.target.value)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape' || e.key === 'Enter') {
            sendUpdateIconRequest(send, socket, props.id, icon)
            editing = false
            unlock(props.id)
            sendUnlockRequest(send, socket, props.id)
            ref.current?.blur()
          }
        }}
        onBlur={() => {
          if (editing && icon !== props.icon) {
            sendUpdateIconRequest(send, socket, props.id, icon)
          }
          editing = false
          unlock(props.id)
          sendUnlockRequest(send, socket, props.id)
        }}
      />
    </>
  )
}

const Text = (props: {
  id: string
  value: string
  send: (value: string) => void
  style?: CSSProperties | undefined
}) => {
  let editing = false
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
      onClick={() => {
        editing = true
        lock(props.id)
        sendLockRequest(send, socket, props.id)
      }}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Escape' || e.key === 'Enter') {
          if (value !== props.value) {
            props.send(value)
          }
          editing = false
          unlock(props.id)
          sendUnlockRequest(send, socket, props.id)
          ref.current?.blur()
        }
      }}
      onBlur={() => {
        if (editing && value !== props.value) {
          props.send(value)
        }
        editing = false
        unlock(props.id)
        sendUnlockRequest(send, socket, props.id)
      }}
    />
  )
}

const Name = (props: { id: string; name: string }) => {
  const { send, socket } = useContext(WebSocketContext)!
  const f = (name: string) => sendUpdateNameRequest(send, socket, props.id, name)

  return <Text id={props.id} value={props.name} send={f} style={{ fontWeight: 'bold' }} />
}

const Property = (props: { id: string; n: number; property: string }) => {
  const { send, socket } = useContext(WebSocketContext)!
  const f = (property: string) => sendUpdatePropertyRequest(send, socket, props.id, property, props.n)

  return (
    <div className={styles.line}>
      <Text id={props.id} value={props.property} send={f} />
      <div>
        <DeleteIcon {...props} type={'property'} />
        <AddIcon {...props} type={'property'} />
      </div>
    </div>
  )
}

const Method = (props: { id: string; n: number; method: string }) => {
  const { send, socket } = useContext(WebSocketContext)!
  const f = (method: string) => sendUpdateMethodRequest(send, socket, props.id, method, props.n)

  return (
    <div className={styles.line}>
      <Text id={props.id} value={props.method} send={f} />
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
