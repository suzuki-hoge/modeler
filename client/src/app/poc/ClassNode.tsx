import styles from './class.module.scss'
import { Handle, Position, useStore } from 'reactflow'
import React, { memo } from 'react'

export const ClassNode = memo(function InnerClassNode({ id }: { id: string }) {
  const icon: string = useStore((s) => {
    const node = s.nodeInternals.get(id)!!

    return node.data.icon
  })

  return (
    <>
      <div className={styles.node}>
        <div className={styles.name}>
          <span>{icon}</span>
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
})

export default ClassNode
