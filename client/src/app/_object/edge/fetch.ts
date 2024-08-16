import { Edge } from '@xyflow/react'
import axios from 'axios'

import { PageEdgeData, ProjectEdgeData } from '@/app/_object/edge/type'

export function fetchProjectEdges(projectId: string): Promise<Edge<ProjectEdgeData>[]> {
  type Fetched = Edge<ProjectEdgeData>[]

  return axios.get<Fetched>(`http://localhost:8080/project/${projectId}/edges`).then((response) => response.data)
}

export function fetchPageEdges(pageId: string): Promise<Edge<PageEdgeData>[]> {
  type Fetched = Edge<ProjectEdgeData>[]
  type Parsed = Edge<ProjectEdgeData>[]

  const parse = (data: Fetched): Parsed =>
    data.map((row) => ({ ...row, sourceHandle: 'center', targetHandle: 'center' }))

  return axios
    .get<Fetched>(`http://localhost:8080/page/${pageId}/edges`)
    .then((response) => response.data)
    .then(parse)
}
