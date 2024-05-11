import React from 'react'
import { Handle, Position } from 'reactflow'

import styles from './class.module.scss'

export default function ClassNode({ data }: { data: { icon: string } }) {
  return (
    <>
      <div className={styles.node}>
        <div className={styles.name}>
          <span>{data.icon}</span>
          Item
        </div>

        <div className={styles.properties}>
          <span className={styles.property}>id: Id</span>
          <span className={styles.property}>id: Id</span>
        </div>
        <div className={styles.methods}>
          <span className={styles.method}>getId(): Id</span>
          <span className={styles.method}>getId(): Id</span>
        </div>
      </div>
      <Handle type='target' position={Position.Top} />
      <Handle type='source' position={Position.Bottom} />
    </>
  )
}
