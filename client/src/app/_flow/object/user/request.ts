import axios from 'axios'

import { UserConfig } from '@/app/_flow/object/user/type'

export function getUserConfig(userId: string): Promise<UserConfig> {
  type Fetched = UserConfig

  return axios
    .get<Fetched>(`http://localhost:8080/user/config`, { headers: { 'Modeler-User-Id': userId } })
    .then((response) => response.data)
}
