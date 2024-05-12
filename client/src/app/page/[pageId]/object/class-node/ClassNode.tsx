import React, { CSSProperties, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AiOutlineDelete } from 'react-icons/ai'
import { MdAddCircleOutline } from 'react-icons/md'
import { Handle, Position } from 'reactflow'

import { WebSocketContext } from '@/app/page/[pageId]/context'
import { sendDeleteMethodRequest } from '@/app/page/[pageId]/message/delete-method'
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
        <Icon color={data.icon.color} text={data.icon.text} />
        <Name name={data.name} />
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

const Icon = (props: { color: string; text: string }) => {
  let editing = false
  const [color, setColor] = useState(props.color)
  const [text, setText] = useState(props.text)
  const ref = useRef<HTMLInputElement>(null)

  return (
    <>
      <input
        type={'text'}
        className={styles.icon}
        style={{ backgroundColor: color }}
        value={text}
        maxLength={2}
        ref={ref}
        onClick={() => (editing = true)}
        onChange={(e) => {
          setColor(getColor(e.target.value))
          setText(e.target.value)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape' || e.key === 'Enter') {
            editing = false
            console.log('send update-icon')
            ref.current?.blur()
          }
        }}
        onBlur={() => {
          if (editing) {
            editing = false
            console.log('send update-icon')
          }
        }}
      />
    </>
  )
}

const Text = (props: { value: string; style?: CSSProperties | undefined }) => {
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
            console.log('send')
          }
          ref.current?.blur()
        }
      }}
      onBlur={() => {
        if (editing && value !== props.value) {
          editing = false
          console.log('send')
        }
      }}
    />
  )
}

const Name = (props: { name: string }) => {
  return <Text value={props.name} style={{ fontWeight: 'bold' }} />
}

const Property = (props: { id: string; n: number; property: string }) => {
  return (
    <div className={styles.line}>
      <Text value={props.property} />
      <div>
        <DeleteIcon {...props} type={'property'} />
        <AddIcon {...props} type={'property'} />
      </div>
    </div>
  )
}

const Method = (props: { id: string; n: number; method: string }) => {
  return (
    <div className={styles.line}>
      <Text value={props.method} />
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

  return (
    <MdAddCircleOutline
      className={styles.button}
      onClick={() => {
        if (props.type === 'property') {
          addProperty(props.id, props.n)
        }
        if (props.type === 'method') {
          addMethod(props.id, props.n)
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
        }
        if (props.type === 'method') {
          deleteMethod(props.id, props.n)
          sendDeleteMethodRequest(send, socket, props.id, props.n)
        }
      }}
    />
  )
}
