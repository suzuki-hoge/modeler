import toast from 'react-hot-toast'
import z from 'zod'

// types

const type = 'disconnect'

const disconnectResponse = z.object({
  type: z.string(),
  sessionId: z.string(),
  userId: z.string(),
})
type DisconnectResponse = z.infer<typeof disconnectResponse>

// send

// handle

export function handleDisconnect(response: unknown) {
  if (isDisconnectResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    toast.success(`Disconnect ${response.userId}.`)
  }
}

function isDisconnectResponse(value: unknown): value is DisconnectResponse {
  const json = disconnectResponse.safeParse(value)
  return json.success && json.data.type === type
}
