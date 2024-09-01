import axios from 'axios'

import { UserProjectPage } from '@/app/_manage/object/user-project-page/type'

export function getUserProjectPages(userId: string): Promise<UserProjectPage[]> {
  return axios
    .get<UserProjectPage[]>(`http://localhost:8080/user-project-pages`, { headers: { 'Modeler-User-Id': userId } })
    .then((response) => response.data)
}

export function postCreateUserProjectPage(userId: string, projectName: string, pageName: string): Promise<void> {
  const projectId = crypto.randomUUID()
  const pageId = crypto.randomUUID()
  return axios
    .post<void>(
      `http://localhost:8080/user-project-page/create`,
      { projectId, pageId, projectName, pageName },
      { headers: { 'Modeler-User-Id': userId } },
    )
    .then(() => {})
}
