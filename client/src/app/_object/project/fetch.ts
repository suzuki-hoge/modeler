import axios from 'axios'

import { Project } from '@/app/_object/project/type'

export function postCreateProject(userId: string, projectName: string, pageName: string): Promise<void> {
  return axios
    .post<void>(
      `http://localhost:8080/project/create`,
      { projectName, pageName },
      { headers: { 'Modeler-User-Id': userId } },
    )
    .then(() => {})
}

export function fetchProjects(): Promise<Project[]> {
  return axios.get<Project[]>(`http://localhost:8080/projects`).then((response) => response.data)
}
