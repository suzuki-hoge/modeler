import z from 'zod'

// types

const type = 'connect'

const connectResponse = z.object({
  type: z.string(),
  sessionId: z.string(),
  user: z.string(),
})
type ConnectResponse = z.infer<typeof connectResponse>

// send

// handle

export function handleConnect(response: unknown, handler: (response: ConnectResponse) => void) {
  if (isConnectResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    handler(response)
  }
}

function isConnectResponse(value: unknown): value is ConnectResponse {
  const json = connectResponse.safeParse(value)
  return json.success && json.data.type === type
}
