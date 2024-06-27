import axios from 'axios'
import { Node } from 'reactflow'
import useSWR from 'swr'

import { NodeIcon, PageNodeData, ProjectNodeData } from '@/app/_object/node/type'

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
