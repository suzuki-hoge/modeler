import React from 'react'
import { PiArrowDownRightLight, PiArrowDownRightDuotone } from 'react-icons/pi'
import { Handle, Position } from 'reactflow'

import styles from './handles.module.scss'

export const Handles = () => {
  return (
    <>
      <Handle type='source' id={'t1'} className={`${styles.dot} ${styles.t1}`} position={Position.Top} />
      <PiArrowDownRightLight className={`${styles.arrow} ${styles.t1}`} />
      <Handle type='source' id={'t2'} className={`${styles.dot} ${styles.t2}`} position={Position.Top} />
      <PiArrowDownRightDuotone className={`${styles.arrow} ${styles.t2}`} />

      <Handle type='source' id={'r1'} className={`${styles.dot} ${styles.r1}`} position={Position.Right} />
      <PiArrowDownRightLight className={`${styles.arrow} ${styles.r1}`} />
      <Handle type='source' id={'r2'} className={`${styles.dot} ${styles.r2}`} position={Position.Right} />
      <PiArrowDownRightDuotone className={`${styles.arrow} ${styles.r2}`} />

      <Handle type='source' id={'b1'} className={`${styles.dot} ${styles.b1}`} position={Position.Bottom} />
      <PiArrowDownRightLight className={`${styles.arrow} ${styles.b1}`} />
      <Handle type='source' id={'b2'} className={`${styles.dot} ${styles.b2}`} position={Position.Bottom} />
      <PiArrowDownRightDuotone className={`${styles.arrow} ${styles.b2}`} />

      <Handle type='source' id={'l1'} className={`${styles.dot} ${styles.l1}`} position={Position.Left} />
      <PiArrowDownRightLight className={`${styles.arrow} ${styles.l1}`} />
      <Handle type='source' id={'l2'} className={`${styles.dot} ${styles.l2}`} position={Position.Left} />
      <PiArrowDownRightDuotone className={`${styles.arrow} ${styles.l2}`} />

      <Handle type='source' id={'center'} className={styles.center} position={Position.Bottom} />
      <Handle type='target' id={'center'} className={styles.center} position={Position.Bottom} />
    </>
  )
}
