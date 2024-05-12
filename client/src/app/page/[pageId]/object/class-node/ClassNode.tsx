import React, { CSSProperties, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AiOutlineDelete } from 'react-icons/ai'
import { MdAddCircleOutline } from 'react-icons/md'
import { Handle, Position } from 'reactflow'

import { WebSocketContext } from '@/app/page/[pageId]/context'
import { sendAddMethodRequest } from '@/app/page/[pageId]/message/add-method'
import { sendAddPropertyRequest } from '@/app/page/[pageId]/message/add-property'
import { sendDeleteMethodRequest } from '@/app/page/[pageId]/message/delete-method'
import { sendDeletePropertyRequest } from '@/app/page/[pageId]/message/delete-property'
import { sendUpdateIconRequest } from '@/app/page/[pageId]/message/update-icon'
import { sendUpdateMethodRequest } from '@/app/page/[pageId]/message/update-method'
import { sendUpdateNameRequest } from '@/app/page/[pageId]/message/update-name'
import { sendUpdatePropertyRequest } from '@/app/page/[pageId]/message/update-property'
import { NodeData } from '@/app/page/[pageId]/object/node'
import { useStore } from '@/app/page/[pageId]/object/store'

import styles from './class-node.module.scss'

export interface Props {
  id: string
  data: NodeData
}

export const ClassNode = ({ id, data }: Props) => {
  return (
    <div className={styles.component}>
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

  return (
    <>
      <input
        type={'text'}
        className={styles.icon}
        style={{ backgroundColor: getColor(icon) }}
        value={icon}
        maxLength={2}
        ref={ref}
        onClick={() => (editing = true)}
        onChange={(e) => {
          setIcon(e.target.value)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape' || e.key === 'Enter') {
            editing = false
            sendUpdateIconRequest(send, socket, props.id, icon)
            ref.current?.blur()
          }
        }}
        onBlur={() => {
          if (editing) {
            editing = false
            sendUpdateIconRequest(send, socket, props.id, icon)
          }
        }}
      />
    </>
  )
}

const Text = (props: { value: string; send: (value: string) => void; style?: CSSProperties | undefined }) => {
  let editing = false
  const [value, setValue] = useState(props.value)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => setValue(props.value), [props.value])

  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.style.width = value.length !== 0 ? `${value.length * 0.5}rem` : '3rem'
    }
  }, [value.length])

  return (
    <input
      type={'text'}
      className={styles.input}
      style={props.style}
      value={value}
      ref={ref}
      onClick={() => (editing = true)}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Escape' || e.key === 'Enter') {
          editing = false
          if (value !== props.value) {
            props.send(value)
          }
          ref.current?.blur()
        }
      }}
      onBlur={() => {
        if (editing && value !== props.value) {
          editing = false
          props.send(value)
        }
      }}
    />
  )
}

const Name = (props: { id: string; name: string }) => {
  const { send, socket } = useContext(WebSocketContext)!
  const f = (name: string) => sendUpdateNameRequest(send, socket, props.id, name)

  return <Text value={props.name} send={f} style={{ fontWeight: 'bold' }} />
}

const Property = (props: { id: string; n: number; property: string }) => {
  const { send, socket } = useContext(WebSocketContext)!
  const f = (property: string) => sendUpdatePropertyRequest(send, socket, props.id, property, props.n)

  return (
    <div className={styles.line}>
      <Text value={props.property} send={f} />
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
      <Text value={props.method} send={f} />
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
  const addProperty = useStore((state) => state.addProperty)
  const addMethod = useStore((state) => state.addMethod)

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
  const deleteProperty = useStore((state) => state.deleteProperty)
  const deleteMethod = useStore((state) => state.deleteMethod)

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
