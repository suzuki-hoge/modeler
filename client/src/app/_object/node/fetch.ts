import { Node } from '@xyflow/react'
import axios from 'axios'
import useSWRImmutable from 'swr/immutable'

import { NodeIcon, PageNodeData, ProjectNodeData } from '@/app/_object/node/type'

export function useNodeIcons(projectId: string): [NodeIcon[] | undefined, boolean] {
  type Fetched = NodeIcon[]
  type Parsed = NodeIcon[]

  const url = `http://localhost:8080/project/${projectId}/icons`

  const parser = (data: Fetched): Parsed => data
  const fetcher = (url: string): Promise<Parsed> => axios.get<Fetched>(url).then((res) => parser(res.data))

  const { data, isValidating } = useSWRImmutable<NodeIcon[]>(url, fetcher)
  return [data, isValidating]
}

export function useProjectNodes(projectId: string): [Node<ProjectNodeData>[] | undefined, boolean] {
  type Fetched = Omit<Node<ProjectNodeData>, 'position'>[]
  type Parsed = Node<ProjectNodeData>[]

  const url = `http://localhost:8080/project/${projectId}/nodes`

  const parser = (data: Fetched): Parsed => data.map((row) => ({ ...row, position: { x: 0, y: 0 } }))
  const fetcher = (url: string): Promise<Parsed> => axios.get<Fetched>(url).then((res) => parser(res.data))

  const { data, isValidating } = useSWRImmutable(url, fetcher)
  return [data, isValidating]
}

export function usePageNodes(pageId: string): [Node<PageNodeData>[] | undefined, boolean] {
  type Fetched = Omit<Node<PageNodeData>, 'data'>[]
  type Parsed = Node<PageNodeData>[]

  const url = `http://localhost:8080/page/${pageId}/nodes`

  const parser = (data: Fetched): Parsed => data.map((row) => ({ ...row, data: { modified: '' } }))
  const fetcher = (url: string): Promise<Parsed> => axios.get<Fetched>(url).then((res) => parser(res.data))

  const { data, isValidating } = useSWRImmutable(url, fetcher)
  return [data, isValidating]
}
