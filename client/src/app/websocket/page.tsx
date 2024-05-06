'use client'

import useWebSocket from 'react-use-websocket'
import { useState } from 'react'

interface Message {
  kind: string
  message: string
}

export default function Page() {
  const { sendJsonMessage, lastJsonMessage } = useWebSocket<Message>('ws://127.0.0.1:8080/ws/')
  const [message, setMessage] = useState('')

  const click = () => {
    if (message.trim() !== '') {
      sendJsonMessage({ kind: 'client', message: message.trim() })
      setMessage('')
    }
  }

  return (
    <div>
      <div>Last received message: {lastJsonMessage && lastJsonMessage.message}</div>
      <input type='text' value={message} onChange={(e) => setMessage(e.target.value)} />
      <button onClick={click}>Send Message</button>
    </div>
  )
}
