import React, { memo } from 'react'
import { Handle, Position } from 'reactflow'

import { SimpleArrowIcon } from '@/app/_component/icon/simple-arrow-icon/SimpleArrowIcon'

import styles from './handles.module.scss'

interface Props {
  visible: boolean
  icon: 'simple' | 'generalization'
}

export const Handles = memo(function _Handles(props: Props) {
  return (
    <>
      {props.visible && (
        <>
          <Handle type='source' className={styles.topHandle} position={Position.Top} />
          <SimpleArrowIcon className={styles.topArrow} vector={'up'} />
          <Handle type='source' className={styles.rightHandle} position={Position.Right} />
          <SimpleArrowIcon className={styles.rightArrow} vector={'right'} />
          <Handle type='source' className={styles.bottomHandle} position={Position.Bottom} />
          <SimpleArrowIcon className={styles.bottomArrow} vector={'down'} />
          <Handle type='source' className={styles.leftHandle} position={Position.Left} />
          <SimpleArrowIcon className={styles.leftArrow} vector={'left'} />
        </>
      )}

      <Handle type='source' id={'center'} className={styles.centerHandle} position={Position.Bottom} />
      <Handle type='target' id={'center'} className={styles.centerHandle} position={Position.Bottom} />
    </>
  )
})
