import z from 'zod'

// types

const type = 'connect'

const connectResponse = z.object({
  type: z.string(),
  session_id: z.string(),
  user: z.string(),
})
export type ConnectResponse = z.infer<typeof connectResponse>

// receive

export function handleConnectResponse(response: unknown) {
  if (isConnectResponse(response)) {
    console.log(`handle ${type}`, response)
  }
}

export function isConnectResponse(value: unknown): value is ConnectResponse {
  const json = connectResponse.safeParse(value)
  return json.success && json.data.type === type
}
