import { Node } from '@xyflow/react'
import axios from 'axios'

import { NodeIcon, PageNodeData, ProjectNodeData } from '@/app/_flow/object/node/type'

export function getNodeIcons(projectId: string): Promise<NodeIcon[]> {
  type Fetched = NodeIcon[]

  return axios.get<Fetched>(`http://localhost:8080/project/${projectId}/icons`).then((response) => response.data)
}

export function getProjectNodes(projectId: string): Promise<Node<ProjectNodeData>[]> {
  type Fetched = Omit<Node<ProjectNodeData>, 'position'>[]
  type Parsed = Node<ProjectNodeData>[]

  const parse = (data: Fetched): Parsed => data.map((row) => ({ ...row, position: { x: 0, y: 0 } }))

  return axios
    .get<Fetched>(`http://localhost:8080/project/${projectId}/nodes`)
    .then((response) => response.data)
    .then(parse)
}

export function getPageNodes(pageId: string): Promise<Node<PageNodeData>[]> {
  type Fetched = Omit<Node<PageNodeData>, 'data'>[]
  type Parsed = Node<PageNodeData>[]

  const parse = (data: Fetched): Parsed => data.map((row) => ({ ...row, data: { modified: '' } }))

  return axios
    .get<Fetched>(`http://localhost:8080/page/${pageId}/nodes`)
    .then((response) => response.data)
    .then(parse)
}
