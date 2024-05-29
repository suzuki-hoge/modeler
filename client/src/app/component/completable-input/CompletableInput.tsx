'use client'
import 'reactflow/dist/style.css'

import React, { useRef, useState } from 'react'

import {
  FrontRefString,
  InnerRefString,
  pop,
  pushChar,
  pushRefFront,
  pushRefInner,
} from '@/app/component/completable-input/RefString'

import styles from './completable-input.module.scss'

const FrontHtml = ({ refString }: { refString: FrontRefString }) => {
  return refString.map(({ value, ref }, i) => (
    <span key={i} className={ref ? styles.ref : styles.text}>
      {value}
    </span>
  ))
}

interface Props {}
export const CompletableInput = ({}: Props) => {
  const [showList, setShowList] = useState(false)
  const [frontRefString, setFrontRefString] = useState<FrontRefString>([])
  const [innerRefString, setInnerRefString] = useState<InnerRefString>([])
  const ref = useRef<HTMLInputElement>(null)

  return (
    <div className={styles.component} onClick={() => ref.current?.focus()}>
      <FrontHtml refString={frontRefString} />
      <input
        className={styles.input}
        value={''}
        onChange={(e) => {}}
        onKeyDown={(e) => {
          if (e.code === 'Space' && e.ctrlKey) {
            setShowList(true)
          } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            setFrontRefString((refString) => pushChar(refString, e.key))
            setInnerRefString((refString) => pushChar(refString, e.key))
          } else if (e.code === 'Backspace') {
            setFrontRefString((refString) => pop(refString))
            setInnerRefString((refString) => pop(refString))
          } else {
            e.preventDefault()
          }
        }}
        ref={ref}
      />
      <br />
      {showList && (
        <select
          onChange={(e) => {
            const id = e.target.value
            const label = id === '123' ? 'Foo' : 'Bar'
            setFrontRefString((refString) => pushRefFront(refString, label))
            setInnerRefString((refString) => pushRefInner(refString, id))
            setShowList(false)
            ref.current?.focus()
          }}
        >
          <option value={'123'}>Foo</option>
          <option value={'456'}>Bar</option>
        </select>
      )}
      <pre>{JSON.stringify(innerRefString)}</pre>
    </div>
  )
}
