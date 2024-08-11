import { EdgeLabelRenderer } from '@xyflow/react'
import React from 'react'

import { GeneralizationArrowIcon } from '@/app/_component/icon/generalization-arrow-icon/GeneralizationArrowIcon'
import { RotateIcon } from '@/app/_component/icon/rotate-icon/RotateIcon'
import { SimpleArrowIcon } from '@/app/_component/icon/simple-arrow-icon/SimpleArrowIcon'
import { CreatableSelector } from '@/app/_component/selector/CreatableSelector'
import { ArrowType } from '@/app/_object/edge/type'

import styles from './edge-palette.module.scss'

interface Props {
  id: string
  arrowType: ArrowType
  label: string
  x: number
  y: number
  onRotate: () => void
  onChangeToGeneralization: () => void
  onChangeToSimple: () => void
  onChangeLabel: (label: string) => void
}

export const EdgePalette = (props: Props) => {
  return (
    <EdgeLabelRenderer>
      <div
        style={{
          position: 'absolute',
          transform: `translate(-50%, -50%) translate(${props.x}px,${props.y}px)`,
          fontSize: 12,
          pointerEvents: 'all',
        }}
        className='nodrag nopan'
      >
        <div className={styles.component}>
          <RotateIcon onClick={props.onRotate} />
          {props.arrowType === 'simple' && (
            <GeneralizationArrowIcon vector={'up'} onClick={props.onChangeToGeneralization} />
          )}
          {props.arrowType === 'generalization' && <SimpleArrowIcon vector={'up'} onClick={props.onChangeToSimple} />}
          <CreatableSelector
            width={'20ch'}
            placeholder={'...'}
            choices={[{ value: '1' }, { value: '0..1' }, { value: '0..*' }, { value: '1..*' }]}
            preview={(label) => <span>{label.value}</span>}
            searchKeys={['value']}
            onSelect={(label) => props.onChangeLabel(label.value)}
            onCreate={(value) => props.onChangeLabel(value)}
          />
        </div>
      </div>
    </EdgeLabelRenderer>
  )
}
