import { Edge } from '@xyflow/react'
import axios from 'axios'

import { PageEdgeData, ProjectEdgeData } from '@/app/_flow/object/edge/type'

export function getProjectEdges(projectId: string): Promise<Edge<ProjectEdgeData>[]> {
  type Fetched = Edge<ProjectEdgeData>[]

  return axios.get<Fetched>(`http://localhost:8080/project/${projectId}/edges`).then((response) => response.data)
}

export function getPageEdges(pageId: string): Promise<Edge<PageEdgeData>[]> {
  type Fetched = Edge<ProjectEdgeData>[]

  return axios.get<Fetched>(`http://localhost:8080/page/${pageId}/edges`).then((response) => response.data)
}
