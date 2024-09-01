import axios from 'axios'

export function postSignUp(userId: string): Promise<boolean> {
  return axios
    .post<{ signUpNewUser: boolean }>(`http://localhost:8080/user/sign_up`, { userId })
    .then((response) => response.data.signUpNewUser)
}
