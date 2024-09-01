import toast from 'react-hot-toast'
import z from 'zod'

// types

const type = 'error-information'

const errorInformationResponse = z.object({
  type: z.string(),
  message: z.string(),
})
type ErrorInformationResponse = z.infer<typeof errorInformationResponse>

// send

// handle

export function handleErrorInformation(response: unknown) {
  if (isErrorInformationResponse(response)) {
    console.log(`<-- ${JSON.stringify(response)}`)
    toast.error(response.message)
  }
}

function isErrorInformationResponse(value: unknown): value is ErrorInformationResponse {
  const json = errorInformationResponse.safeParse(value)
  return json.success && json.data.type === type
}
