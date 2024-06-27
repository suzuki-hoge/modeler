import axios from 'axios'
import { Edge } from 'reactflow'
import useSWR from 'swr'

import { PageEdgeData, ProjectEdgeData } from '@/app/_object/edge/type'

export function useProjectEdges(projectId: string): [Edge<ProjectEdgeData>[] | undefined, boolean] {
  const fetcher = (url: string) => axios.get<Edge<ProjectEdgeData>[]>(url).then((res) => res.data)

  const url = `http://localhost:8080/${projectId}/edges`

  const { data, isValidating } = useSWR<Edge<ProjectEdgeData>[]>(url, fetcher)
  return [data, isValidating]
}

export function usePageEdges(projectId: string, pageId: string): [Edge<PageEdgeData>[] | undefined, boolean] {
  const parse = (data: Edge<PageEdgeData>[]) =>
    data.map((row) => ({ ...row, sourceHandle: 'center', targetHandle: 'center' }))
  const fetcher = (url: string) => axios.get<Edge<PageEdgeData>[]>(url).then((res) => parse(res.data))

  const url = `http://localhost:8080/${projectId}/${pageId}/edges`

  const { data, isValidating } = useSWR<Edge<PageEdgeData>[]>(url, fetcher)
  return [data, isValidating]
}
