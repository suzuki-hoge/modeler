import { Edge } from '@xyflow/react'
import axios from 'axios'
import useSWR from 'swr'

import { PageEdgeData, ProjectEdgeData } from '@/app/_object/edge/type'

export function useProjectEdges(projectId: string): [Edge<ProjectEdgeData>[] | undefined, boolean] {
  const url = `http://localhost:8080/project/${projectId}/edges`

  const { data, isValidating } = useSWR(url, fetchProjectEdges)
  return [data, isValidating]
}

export function usePageEdges(pageId: string): [Edge<PageEdgeData>[] | undefined, boolean] {
  const url = `http://localhost:8080/page/${pageId}/edges`

  const { data, isValidating } = useSWR(url, fetchPageEdges)
  return [data, isValidating]
}

// fetchers & parsers

function fetchProjectEdges(url: string): Promise<Edge<ProjectEdgeData>[]> {
  return axios.get<Edge<ProjectEdgeData>[]>(url).then((res) => res.data)
}

function fetchPageEdges(url: string): Promise<Edge<PageEdgeData>[]> {
  return axios.get<Edge<PageEdgeData>[]>(url).then((res) => parsePageEdges(res.data))
}

function parsePageEdges(data: Edge<PageEdgeData>[]): Edge<PageEdgeData>[] {
  return data.map((row) => ({ ...row, sourceHandle: 'center', targetHandle: 'center' }))
}
