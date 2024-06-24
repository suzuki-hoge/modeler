import axios from 'axios'
import { Node } from 'reactflow'
import useSWR from 'swr'

import { NodeIcon, PageNodeData, ProjectNodeData } from '@/app/_object/node/type'

export function getInitialNodes(): Node<ProjectNodeData>[] {
  return [
    {
      id: 'controller',
      type: 'class',
      position: { x: 50, y: -180 },
      data: {
        iconId: 'controller',
        name: 'ItemController',
        properties: [],
        methods: ['apply()'],
      },
    },
    {
      id: 'usecase',
      type: 'class',
      position: { x: 50, y: -10 },
      data: {
        iconId: 'usecase',
        name: 'ItemUseCase',
        properties: [],
        methods: ['create(): ref#item#'],
      },
    },
    {
      id: 'store',
      type: 'class',
      position: { x: -150, y: 160 },
      data: {
        iconId: 'store',
        name: 'ItemStore',
        properties: [],
        methods: ['findAll(): List<ref#item#>', 'save(item: ref#item#)'],
      },
    },
    {
      id: 'item',
      type: 'class',
      position: { x: 175, y: 160 },
      data: {
        iconId: 'data',
        name: 'Item',
        properties: ['t: T'],
        methods: ['get(): T', 'set(t: T)'],
      },
    },
  ]
}

export function useNodeIcons(projectId: string): [NodeIcon[] | undefined, boolean] {
  const fetcher = (url: string) => axios.get<NodeIcon[]>(url).then((res) => res.data)

  const url = `http://localhost:8080/${projectId}/icons`

  const { data, isValidating } = useSWR<NodeIcon[]>(url, fetcher)
  return [data, isValidating]
}

export function useProjectNodes(projectId: string): [Node<ProjectNodeData>[] | undefined, boolean] {
  type Data = Omit<Node<ProjectNodeData>, 'position'>[]

  const parse = (data: Data) => data.map((row) => ({ ...row, position: { x: 0, y: 0 } }))
  const fetcher = (url: string) => axios.get<Data>(url).then((res) => parse(res.data))

  const url = `http://localhost:8080/${projectId}/nodes`

  const { data, isValidating } = useSWR<Node<ProjectNodeData>[]>(url, fetcher)
  return [data, isValidating]
}

export function usePageNodes(projectId: string, pageId: string): [Node<PageNodeData>[] | undefined, boolean] {
  type Data = Omit<Node<PageNodeData>, 'data'>[]

  const parse = (data: Data) => data.map((row) => ({ ...row, data: {} }))
  const fetcher = (url: string) => axios.get<Data>(url).then((res) => parse(res.data))

  const url = `http://localhost:8080/${projectId}/${pageId}/nodes`

  const { data, isValidating } = useSWR<Node<PageNodeData>[]>(url, fetcher)
  return [data, isValidating]
}
