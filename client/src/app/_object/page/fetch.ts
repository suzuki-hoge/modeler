import axios from 'axios'
import useSWR from 'swr'

import { Page } from '@/app/_object/page/type'

export function usePages(projectId: string): [Page[] | undefined, boolean] {
  const url = `http://localhost:8080/project/${projectId}/pages`

  const { data, isValidating } = useSWR<Page[]>(url, fetchPages)
  return [data, isValidating]
}

// fetchers & parsers

function fetchPages(url: string): Promise<Page[]> {
  return axios.get<Page[]>(url).then((res) => res.data)
}
