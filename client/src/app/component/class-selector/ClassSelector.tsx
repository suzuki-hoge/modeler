'use client'

import axios from 'axios'
import React, { createContext, useContext, useEffect, useRef } from 'react'
import SelectBase from 'react-select/base'
import CreatableSelect from 'react-select/creatable'
import { MoonLoader } from 'react-spinners'
import { Node, XYPosition } from 'reactflow'
import useSWR from 'swr'

import { allocateNodeId, createNode } from '@/app/object/node/function'
import { NodeData, NodeHeader } from '@/app/object/node/type'

import styles from './class-selector.module.scss'

export type ApplyToNewNode = (node: Node<NodeData>) => void

export interface ClassSelectorVars {
  showClassSelector: boolean
  setShowClassSelector: (showClassSelector: boolean) => void
  newNodePos: XYPosition
  setNewNodePos: (newNodePos: XYPosition) => void
  applyToNewNode: ApplyToNewNode
  setApplyToNewNode: (applyToNewNode: ApplyToNewNode) => void
}

export const ClassSelectorVarsContext = createContext<ClassSelectorVars | null>(null)

const fetcher = (url: string) => axios.get<NodeHeader[]>(url).then((res) => res.data)

type Option =
  | {
      id: string
      icon: string
      name: string
      __isNew__: false
    }
  | {
      label: string
      value: string
      __isNew__: true
    }

export interface Props {
  projectId: string
}

export const ClassSelector = (props: Props) => {
  return (
    <div className={styles.back}>
      <Selector {...props} />
    </div>
  )
}

const Selector = ({ projectId }: Props) => {
  const { showClassSelector, setShowClassSelector, newNodePos, applyToNewNode } = useContext(ClassSelectorVarsContext)!

  const url = `http://localhost:8080/node/headers/${projectId}/0`
  const { data, isValidating } = useSWR<NodeHeader[]>(url, fetcher)

  const ref = useRef<SelectBase<Option>>(null)

  useEffect(() => {
    if (showClassSelector && !isValidating) ref.current?.focus()
  }, [showClassSelector, isValidating])

  if (showClassSelector && isValidating) {
    return <MoonLoader size={25} color={'#22f'} speedMultiplier={0.5} loading={true} />
  } else {
    const options: Option[] = data!.map((header) => ({
      id: header.id,
      icon: header.icon,
      name: header.name,
      __isNew__: false,
    }))

    return (
      <CreatableSelect
        id={'class-selector'}
        options={options}
        placeholder={'Select or Type new'}
        isSearchable
        isClearable
        formatOptionLabel={(option) => {
          if (option.__isNew__) {
            return <span>create {option.value}</span>
          } else {
            return (
              <div className={styles.header}>
                <span className={styles.icon}>{option.icon}</span>
                <span className={styles.name}>{option.name}</span>
              </div>
            )
          }
        }}
        filterOption={(candi, input) =>
          candi.data.__isNew__ || `${candi.data.icon}${candi.data.name}`.toLowerCase().includes(input.toLowerCase())
        }
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
        onChange={(option, meta) => {
          if (meta.action === 'select-option' && option && !option.__isNew__) {
            // select class
            const targetNode = createNode(allocateNodeId(), newNodePos.x, newNodePos.y, option.name)
            applyToNewNode(targetNode)
          } else if (meta.action === 'create-option' && option && option.__isNew__) {
            // create class
            const targetNode = createNode(allocateNodeId(), newNodePos.x, newNodePos.y, option.value)
            applyToNewNode(targetNode)
          }
          setShowClassSelector(false)
        }}
        onMenuClose={() => setShowClassSelector(false)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setShowClassSelector(false)
        }}
        ref={ref}
      />
    )
  }
}
