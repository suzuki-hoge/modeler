import React from 'react'
import { AiOutlineDelete } from 'react-icons/ai'
import { MdAddCircleOutline } from 'react-icons/md'
import { Handle, Position } from 'reactflow'

import { NodeData } from '@/app/page/[pageId]/object/node'
import { DeleteMethod, useStore } from '@/app/page/[pageId]/object/store'

import styles from './class-node.module.scss'

export interface Props {
  id: string
  data: NodeData
}

export const ClassNode = ({ id, data }: Props) => {
  const deleteMethod = useStore((state) => state.deleteMethod)

  return (
    <div className={styles.component}>
      <div className={styles.header}>
        <span className={styles.icon}>{data.icon}</span>
        <span className={styles.name}>{data.name}</span>
      </div>

      <hr />

      {data.properties.length !== 0 ? (
        <div className={styles.properties}>
          {data.properties.map((property, i) => (
            <Property key={i} id={id} property={property} />
          ))}
        </div>
      ) : (
        <Empty />
      )}

      <hr />

      {data.methods.length !== 0 ? (
        <div className={styles.methods}>
          {data.methods.map((method, i) => (
            <Method key={i} deleteMethod={deleteMethod} id={id} i={i} method={method} />
          ))}
        </div>
      ) : (
        <Empty />
      )}
      <Handle type='target' position={Position.Top} />
      <Handle type='source' position={Position.Bottom} />
    </div>
  )
}

const Property = (props: { id: string; property: string }) => {
  return (
    <div className={styles.line}>
      <span>{props.property}</span>
      <div>
        {/*<DeleteIcon {...props} />*/}
        <AddIcon />
      </div>
    </div>
  )
}

const Method = (props: { deleteMethod: DeleteMethod; id: string; i: number; method: string }) => {
  return (
    <div className={styles.line}>
      <span>{props.method}</span>
      <div>
        <DeleteIcon {...props} />
        <AddIcon />
      </div>
    </div>
  )
}

const Empty = () => {
  return (
    <div className={styles.line}>
      <div></div>
      <AddIcon />
    </div>
  )
}

const AddIcon = () => {
  return <MdAddCircleOutline className={styles.icon} />
}

const DeleteIcon = (props: { deleteMethod: DeleteMethod; id: string; i: number }) => {
  return <AiOutlineDelete className={styles.icon} onClick={() => props.deleteMethod(props.id, props.i)} />
}
