import axios from 'axios'
import { Edge } from 'reactflow'
import useSWR from 'swr'

import { PageEdgeData, ProjectEdgeData } from '@/app/_object/edge/type'

export function fetchInitialEdges(): Edge<ProjectEdgeData>[] {
  return [
    {
      id: '92870696-c091-41c8-b5e7-28a1beaebc85',
      source: 'controller',
      sourceHandle: 'center',
      target: 'usecase',
      targetHandle: 'center',
      type: 'class',
      markerEnd: 'simple',
      data: { arrowType: 'simple', label: '0..1' },
    },
    {
      id: '80a0c576-aac3-4fa5-b8d7-face0b7d9b72',
      source: 'store',
      sourceHandle: 'center',
      target: 'item',
      targetHandle: 'center',
      type: 'class',
      markerEnd: 'simple',
      data: { arrowType: 'simple', label: '0..*' },
    },
  ]
}

export function useProjectEdges(projectId: string): [Edge<ProjectEdgeData>[] | undefined, boolean] {
  const fetcher = (url: string) => axios.get<Edge<ProjectEdgeData>[]>(url).then((res) => res.data)

  const url = `http://localhost:8080/${projectId}/edges`

  const { data, isValidating } = useSWR<Edge<ProjectEdgeData>[]>(url, fetcher)
  return [data, isValidating]
}

export function usePageEdges(projectId: string, pageId: string): [Edge<PageEdgeData>[] | undefined, boolean] {
  type Data = { objectId: string }[]

  const parse = (data: Data) => data.map((row) => ({ id: row.objectId, source: '', target: '' }))
  const fetcher = (url: string) => axios.get<Data>(url).then((res) => parse(res.data))

  const url = `http://localhost:8080/${projectId}/${pageId}/edges`

  const { data, isValidating } = useSWR<Edge<PageEdgeData>[]>(url, fetcher)
  return [data, isValidating]
}
