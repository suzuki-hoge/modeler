import { Handle, Position } from '@xyflow/react'
import React, { memo } from 'react'

import { SimpleArrowIcon } from '@/app/_component/icon/simple-arrow-icon/SimpleArrowIcon'

import styles from './handles.module.scss'

interface Props {
  visible: boolean
  icon: 'simple' | 'generalization'
}

export const Handles = memo(function _Handles(props: Props) {
  const none = props.visible ? '' : ` ${styles.none}`
  return (
    <>
      <Handle type='source' className={styles.topHandle + none} position={Position.Top} />
      <SimpleArrowIcon className={styles.topArrow + none} size={'small'} border vector={'up'} />
      <Handle type='source' className={styles.rightHandle + none} position={Position.Right} />
      <SimpleArrowIcon className={styles.rightArrow + none} size={'small'} border vector={'right'} />
      <Handle type='source' className={styles.bottomHandle + none} position={Position.Bottom} />
      <SimpleArrowIcon className={styles.bottomArrow + none} size={'small'} border vector={'down'} />
      <Handle type='source' className={styles.leftHandle + none} position={Position.Left} />
      <SimpleArrowIcon className={styles.leftArrow + none} size={'small'} border vector={'left'} />

      <Handle type='source' id={'center'} className={styles.centerHandle} position={Position.Bottom} />
      <Handle type='target' id={'center'} className={styles.centerHandle} position={Position.Bottom} />
    </>
  )
})
