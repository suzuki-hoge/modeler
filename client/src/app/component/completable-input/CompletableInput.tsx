'use client'
import 'reactflow/dist/style.css'

import React, { ChangeEvent, Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import Select from 'react-select'
import SelectBase from 'react-select/base'

import {
  changedByInput,
  changedBySelect,
  findRefPositions,
  innerToParts,
  innerToRef,
  RefString,
} from '@/app/component/completable-input/RefString'
import { NodeNames } from '@/app/object/node/type'

import styles from './completable-input.module.scss'

const FrontHtml = ({ inner }: { inner: string }) => {
  const names: NodeNames = { '123': 'Foo', '456': 'Bar' }
  return (
    <div>
      {innerToParts(inner, names).map(({ value, ref }, i) => (
        <span key={i} className={ref ? styles.ref : styles.text}>
          {value}
        </span>
      ))}
    </div>
  )
}

interface Props {
  inner: string
}
export const CompletableInput = ({ inner }: Props) => {
  const names: NodeNames = { '123': 'Foo', '456': 'Bar' }

  const [cursor, setCursor] = useState(0)
  const [refString, setRefString] = useState(innerToRef(inner, names))
  const [showList, setShowList] = useState(false)

  const refPositions = findRefPositions(refString.inner, names)

  const ref = useRef<HTMLInputElement>(null)

  return (
    <div className={styles.component}>
      <input
        className={styles.input}
        value={refString.front}
        onChange={(e) => {
          setRefString((prev) => changedByInput(prev, e.target.value, names))
        }}
        onKeyDown={(e) => {
          if (e.code === 'Space' && e.ctrlKey) {
            setShowList(true)
            e.preventDefault()
          }
        }}
        ref={ref}
        onSelect={(e: ChangeEvent<HTMLInputElement>) => {
          const i = e.target.selectionStart!
          setCursor(i)
          const isInFrontRef = refPositions.findIndex(({ frontS, frontE }) => frontS < i && i <= frontE) !== -1
          setShowList(isInFrontRef)
        }}
      />
      <br />
      {showList && (
        <Selector
          cursor={cursor}
          refString={refString}
          setRefString={setRefString}
          showList={showList}
          setShowList={setShowList}
        />
      )}
      <FrontHtml inner={refString.inner} />
      <pre>
        {cursor}: {JSON.stringify(refString)}
      </pre>
    </div>
  )
}

type Option = {
  id: string
  label: string
}

interface SelectorProps {
  cursor: number
  refString: RefString
  setRefString: Dispatch<SetStateAction<RefString>>
  showList: boolean
  setShowList: Dispatch<SetStateAction<boolean>>
}
const Selector = (props: SelectorProps) => {
  const names: NodeNames = { '123': 'Foo', '456': 'Bar' }

  const options: Option[] = Object.entries(names).map(([id, label]) => ({ id, label }))

  const ref = useRef<SelectBase<Option>>(null)

  useEffect(() => {
    if (props.showList) ref.current?.focus()
  }, [props.showList])

  return (
    <Select
      id={'completable-input-selector'}
      options={options}
      placeholder={''}
      isSearchable
      styles={{
        control: (base) => ({
          ...base,
        }),
        valueContainer: (base) => ({
          ...base,
          width: '15rem',
        }),
        menu: (base) => ({
          ...base,
          width: `20rem`,
        }),
        menuList: (base) => ({
          ...base,
          // width: `${longest}rem`,
        }),
        option: (base) => ({
          ...base,
          // width: `${longest}rem`,
        }),
      }}
      onChange={(option) => {
        props.setRefString((prev) => changedBySelect(prev, names, option!.id, option!.label, props.cursor))
      }}
      onMenuClose={() => props.setShowList(false)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') props.setShowList(false)
      }}
      ref={ref}
    />
  )
}
