import axios from 'axios'
import useSWR from 'swr'

import { Project } from '@/app/_object/project/type'

export function useProjects(): [Project[] | undefined, boolean] {
  const url = `http://localhost:8080/projects`

  const { data, isValidating } = useSWR<Project[]>(url, fetchProjects)
  return [data, isValidating]
}

// fetchers & parsers

function fetchProjects(url: string): Promise<Project[]> {
  return axios.get<Project[]>(url).then((res) => res.data)
}
