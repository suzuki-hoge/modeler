import axios from 'axios'

import { ProjectPage } from '@/app/_object/page/type'
import { UserConfig } from '@/app/_object/user/type'

export function postSignUp(userId: string): Promise<boolean> {
  return axios
    .post<{ signUpNewUser: boolean }>(`http://localhost:8080/user/sign_up`, { userId })
    .then((response) => response.data.signUpNewUser)
}

export function fetchProjectPages(userId: string): Promise<ProjectPage[]> {
  return axios
    .get<ProjectPage[]>(`http://localhost:8080/user/pages`, { headers: { 'Modeler-User-Id': userId } })
    .then((response) => response.data)
}

export function fetchUserConfig(userId: string): Promise<UserConfig> {
  type Fetched = UserConfig

  return axios
    .get<Fetched>(`http://localhost:8080/user/config`, { headers: { 'Modeler-User-Id': userId } })
    .then((response) => response.data)
}
