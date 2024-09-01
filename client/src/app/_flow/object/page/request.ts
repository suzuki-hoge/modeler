import axios from 'axios'

export function getPageName(pageId: string): Promise<string> {
  return axios.get<string>(`http://localhost:8080/page/${pageId}/name`).then((response) => response.data)
}
