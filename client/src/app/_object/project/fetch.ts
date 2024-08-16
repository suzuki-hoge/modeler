import axios from 'axios'

import { Project } from '@/app/_object/project/type'

export function fetchProjects(): Promise<Project[]> {
  return axios.get<Project[]>(`http://localhost:8080/projects`).then((response) => response.data)
}
