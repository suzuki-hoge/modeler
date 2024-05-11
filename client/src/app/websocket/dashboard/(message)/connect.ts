import z from 'zod'
import { Dispatch, SetStateAction } from 'react'

const connectResponse = z.object({
  type: z.string(),
  session_id: z.string(),
  user: z.string(),
})

export type ConnectResponse = z.infer<typeof connectResponse>

export function isConnectResponse(value: unknown): value is ConnectResponse {
  const json = connectResponse.safeParse(value)
  return json.success && json.data.type === 'connect'
}

export function handleConnectResponse(response: unknown, f: Dispatch<SetStateAction<string[]>>) {
  if (isConnectResponse(response)) {
    f((messages) => messages.concat(`${response.type}: ${response.user}`).slice(-9))
  }
}
