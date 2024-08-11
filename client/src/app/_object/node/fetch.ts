import { Node } from '@xyflow/react'
import axios from 'axios'
import useSWR from 'swr'

import { NodeIcon, PageNodeData, ProjectNodeData } from '@/app/_object/node/type'

export function useNodeIcons(projectId: string): [NodeIcon[] | undefined, boolean] {
  const url = `http://localhost:8080/project/${projectId}/icons`

  const { data, isValidating } = useSWR<NodeIcon[]>(url, fetchNodeIcons)
  return [data, isValidating]
}

export function useProjectNodes(projectId: string): [Node<ProjectNodeData>[] | undefined, boolean] {
  const url = `http://localhost:8080/project/${projectId}/nodes`

  const { data, isValidating } = useSWR(url, fetchProjectNodes)
  return [data, isValidating]
}

export function usePageNodes(pageId: string): [Node<PageNodeData>[] | undefined, boolean] {
  const url = `http://localhost:8080/page/${pageId}/nodes`

  const { data, isValidating } = useSWR(url, fetchPageNodes)
  return [data, isValidating]
}

// fetchers & parsers

function fetchNodeIcons(url: string): Promise<NodeIcon[]> {
  return axios.get<NodeIcon[]>(url).then((res) => res.data)
}

function fetchProjectNodes(url: string): Promise<Node<ProjectNodeData>[]> {
  return axios.get<Omit<Node<ProjectNodeData>, 'position'>[]>(url).then((res) => parseProjectNodes(res.data))
}

function parseProjectNodes(data: Omit<Node<ProjectNodeData>, 'position'>[]): Node<ProjectNodeData>[] {
  return data.map((row) => ({ ...row, position: { x: 0, y: 0 } }))
}

function fetchPageNodes(url: string): Promise<Node<PageNodeData>[]> {
  return axios.get<Omit<Node<PageNodeData>, 'data'>[]>(url).then((res) => parsePageNodes(res.data))
}

function parsePageNodes(data: Omit<Node<PageNodeData>, 'data'>[]): Node<PageNodeData>[] {
  return data.map((row) => ({ ...row, data: { modified: '' } }))
}
