import { Edge } from '@xyflow/react'
import axios from 'axios'
import useSWRImmutable from 'swr/immutable'

import { PageEdgeData, ProjectEdgeData } from '@/app/_object/edge/type'

export function useProjectEdges(projectId: string): [Edge<ProjectEdgeData>[] | undefined, boolean] {
  type Fetched = Edge<ProjectEdgeData>[]
  type Parsed = Edge<ProjectEdgeData>[]

  const url = `http://localhost:8080/project/${projectId}/edges`

  const parser = (data: Fetched): Parsed => data
  const fetcher = (url: string): Promise<Parsed> => axios.get<Fetched>(url).then((res) => parser(res.data))

  const { data, isValidating } = useSWRImmutable(url, fetcher)
  return [data, isValidating]
}

export function usePageEdges(pageId: string): [Edge<PageEdgeData>[] | undefined, boolean] {
  type Fetched = Edge<ProjectEdgeData>[]
  type Parsed = Edge<ProjectEdgeData>[]

  const url = `http://localhost:8080/page/${pageId}/edges`

  const parser = (data: Fetched): Parsed =>
    data.map((row) => ({ ...row, sourceHandle: 'center', targetHandle: 'center' }))
  const fetcher = (url: string): Promise<Parsed> => axios.get<Fetched>(url).then((res) => parser(res.data))

  const { data, isValidating } = useSWRImmutable(url, fetcher)
  return [data, isValidating]
}
