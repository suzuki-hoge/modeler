import React, { memo } from 'react'
import { Handle, Position } from 'reactflow'

import { GeneralizationArrowIcon } from '@/app/_component/icon/generalization-arrow-icon/GeneralizationArrowIcon'
import { SimpleArrowIcon } from '@/app/_component/icon/simple-arrow-icon/SimpleArrowIcon'

import styles from './handles.module.scss'

export const Handles = memo(function _Handles() {
  return (
    <>
      <Handle type='source' id='simple-top' className={`${styles.dot} ${styles.t1}`} position={Position.Top} />
      <SimpleArrowIcon className={`${styles.arrow} ${styles.t1}`} vector={'up'} />
      <Handle type='source' id='simple-top' className={`${styles.dot} ${styles.t2}`} position={Position.Top} />
      <GeneralizationArrowIcon className={`${styles.arrow} ${styles.t2}`} vector={'up'} />

      <Handle type='source' id='simple-right' className={`${styles.dot} ${styles.r1}`} position={Position.Right} />
      <SimpleArrowIcon className={`${styles.arrow} ${styles.r1}`} vector={'right'} />
      <Handle type='source' id='simple-right' className={`${styles.dot} ${styles.r2}`} position={Position.Right} />
      <GeneralizationArrowIcon className={`${styles.arrow} ${styles.r2}`} vector={'right'} />

      <Handle type='source' id='simple-bottom' className={`${styles.dot} ${styles.b1}`} position={Position.Bottom} />
      <SimpleArrowIcon className={`${styles.arrow} ${styles.b1}`} vector={'down'} />
      <Handle type='source' id='simple-bottom' className={`${styles.dot} ${styles.b2}`} position={Position.Bottom} />
      <GeneralizationArrowIcon className={`${styles.arrow} ${styles.b2}`} vector={'down'} />

      <Handle type='source' id='simple-left' className={`${styles.dot} ${styles.l1}`} position={Position.Left} />
      <SimpleArrowIcon className={`${styles.arrow} ${styles.l1}`} vector={'left'} />
      <Handle type='source' id='simple-left' className={`${styles.dot} ${styles.l2}`} position={Position.Left} />
      <GeneralizationArrowIcon className={`${styles.arrow} ${styles.l2}`} vector={'left'} />

      <Handle type='source' id={'center'} className={styles.center} position={Position.Bottom} />
      <Handle type='target' id={'center'} className={styles.center} position={Position.Bottom} />
    </>
  )
})
