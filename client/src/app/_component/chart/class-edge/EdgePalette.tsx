import React, { useContext } from 'react'
import { FaArrowsRotate } from 'react-icons/fa6'
import { PiArrowDownRightDuotone, PiArrowDownRightLight } from 'react-icons/pi'
import CreatableSelect from 'react-select/creatable'
import { EdgeLabelRenderer } from 'reactflow'
import { shallow } from 'zustand/shallow'

import { Point } from '@/app/_component/chart/class-edge/line'
import { SocketContext } from '@/app/_socket/socket'
import { updateEdge } from '@/app/_store/edge/function'
import { EdgeData } from '@/app/_store/edge/type'
import { selector, useStore } from '@/app/_store/store'

import styles from './edge-palette.module.scss'

interface Props {
  id: string
  data: EdgeData
  pos: Point
}

export const EdgePalette = (props: Props) => {
  return (
    <EdgeLabelRenderer>
      <div
        style={{
          position: 'absolute',
          transform: `translate(-50%, -50%) translate(${props.pos.x}px,${props.pos.y}px)`,
          fontSize: 12,
          pointerEvents: 'all',
        }}
        className='nodrag nopan'
      >
        <div className={styles.component}>
          <Reverse {...props} />
          {props.data.arrowType == 'filled-arrow' && <ToV {...props} />}
          {props.data.arrowType == 'v-arrow' && <ToFilled {...props} />}
          <ChangeLabel {...props} />
        </div>
      </div>
    </EdgeLabelRenderer>
  )
}

const Reverse = ({ id }: Props) => {
  const store = useStore(selector, shallow)
  const socket = useContext(SocketContext)!

  return (
    <FaArrowsRotate
      className={styles.reverse}
      onClick={() => {
        store.updateEdge(id, (edge) => updateEdge(edge, { src: edge.target, dst: edge.source }))
        socket.updateEdge(store.getEdge(id))
      }}
    />
  )
}

const ToV = ({ id }: Props) => {
  const store = useStore(selector, shallow)
  const socket = useContext(SocketContext)!

  return (
    <PiArrowDownRightLight
      className={styles.arrow}
      onClick={() => {
        store.updateEdge(id, (edge) => updateEdge(edge, { arrowType: 'v-arrow' }))
        socket.updateEdge(store.getEdge(id))
      }}
    />
  )
}

const ToFilled = ({ id }: Props) => {
  const store = useStore(selector, shallow)
  const socket = useContext(SocketContext)!

  return (
    <PiArrowDownRightDuotone
      className={styles.arrow}
      onClick={() => {
        store.updateEdge(id, (edge) => updateEdge(edge, { arrowType: 'filled-arrow' }))
        socket.updateEdge(store.getEdge(id))
      }}
    />
  )
}

const ChangeLabel = ({ id, data }: Props) => {
  const store = useStore(selector, shallow)
  const socket = useContext(SocketContext)!

  return (
    <CreatableSelect
      isClearable
      defaultValue={{ value: data.label, label: data.label }}
      options={[
        { value: '1', label: '1' },
        { value: '0..1', label: '0..1' },
        { value: '0..*', label: '0..*' },
        { value: '1..*', label: '1..*' },
      ]}
      styles={{
        control: (base) => ({
          ...base,
          border: 'none',
          boxShadow: 'none',
          height: '1.4rem',
          minHeight: '1.4rem',
        }),
        valueContainer: (base) => ({
          ...base,
          width: '1.5rem',
          fontSize: '0.7rem',
          padding: 0,
        }),
        menu: (base) => ({
          ...base,
          width: '1.5rem',
          padding: 0,
        }),
        menuList: (base) => ({
          ...base,
          // width: '1.5rem',
          fontSize: '0.7rem',
          padding: 0,
        }),
        option: (base) => ({
          ...base,
          // width: '1.5rem',
          padding: '3px',
        }),
      }}
      components={{
        DropdownIndicator: undefined,
        ClearIndicator: undefined,
      }}
      onChange={(v, meta) => {
        if (meta.action === 'select-option' || meta.action === 'create-option') {
          store.updateEdge(id, (edge) => updateEdge(edge, { label: v!.label }))
          socket.updateEdge(store.getEdge(id))
        }
      }}
    />
  )
}
