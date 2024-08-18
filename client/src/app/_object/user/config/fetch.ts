import axios from 'axios'

import { UserConfig } from '@/app/_object/user/config/type'

export function fetchUserConfig(userId: string): Promise<UserConfig> {
  type Fetched = UserConfig

  return axios.get<Fetched>(`http://localhost:8080/user/${userId}/config`).then((response) => response.data)
}
