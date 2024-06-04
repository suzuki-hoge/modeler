import React from 'react'
import { PiArrowDownRightLight, PiArrowDownRightDuotone } from 'react-icons/pi'
import { Handle, Position } from 'reactflow'

import styles from './handles.module.scss'

export const Handles = () => {
  return (
    <>
      <Handle type='source' id={'tv'} className={`${styles.dot} ${styles.tv}`} position={Position.Top} />
      <PiArrowDownRightLight className={`${styles.arrow} ${styles.tv}`} />
      <Handle type='source' id={'tf'} className={`${styles.dot} ${styles.tf}`} position={Position.Top} />
      <PiArrowDownRightDuotone className={`${styles.arrow} ${styles.tf}`} />

      <Handle type='source' id={'rv'} className={`${styles.dot} ${styles.rv}`} position={Position.Right} />
      <PiArrowDownRightLight className={`${styles.arrow} ${styles.rv}`} />
      <Handle type='source' id={'rf'} className={`${styles.dot} ${styles.rf}`} position={Position.Right} />
      <PiArrowDownRightDuotone className={`${styles.arrow} ${styles.rf}`} />

      <Handle type='source' id={'bv'} className={`${styles.dot} ${styles.bv}`} position={Position.Bottom} />
      <PiArrowDownRightLight className={`${styles.arrow} ${styles.bv}`} />
      <Handle type='source' id={'bf'} className={`${styles.dot} ${styles.bf}`} position={Position.Bottom} />
      <PiArrowDownRightDuotone className={`${styles.arrow} ${styles.bf}`} />

      <Handle type='source' id={'lv'} className={`${styles.dot} ${styles.lv}`} position={Position.Left} />
      <PiArrowDownRightLight className={`${styles.arrow} ${styles.lv}`} />
      <Handle type='source' id={'lf'} className={`${styles.dot} ${styles.lf}`} position={Position.Left} />
      <PiArrowDownRightDuotone className={`${styles.arrow} ${styles.lf}`} />

      <Handle type='source' id={'center'} className={styles.center} position={Position.Bottom} />
      <Handle type='target' id={'center'} className={styles.center} position={Position.Bottom} />
    </>
  )
}
