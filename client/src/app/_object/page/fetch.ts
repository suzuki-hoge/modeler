import axios from 'axios'

import { Page } from '@/app/_object/page/type'

export function fetchProjectPages(projectId: string): Promise<Page[]> {
  return axios.get<Page[]>(`http://localhost:8080/project/${projectId}/pages`).then((response) => response.data)
}

export function fetchPage(pageId: string): Promise<Page> {
  return axios.get<Page>(`http://localhost:8080/page/${pageId}`).then((response) => response.data)
}
