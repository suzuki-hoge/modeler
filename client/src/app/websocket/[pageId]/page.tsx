'use client'

import useWebSocket from 'react-use-websocket'
import { useState } from 'react'

interface Message {
  kind: string
  message: string
}

export default function Page({ params }: { params: { pageId: string } }) {
  const [message, setMessage] = useState('')
  const { sendJsonMessage, lastJsonMessage } = useWebSocket<Message>(`ws://127.0.0.1:8080/ws/${params.pageId}`)

  const click = () => {
    if (message.trim() !== '') {
      sendJsonMessage({ kind: 'client', message: message.trim() })
      setMessage('')
    }
  }

  return (
    <div>
      <p>your page id: {params.pageId}</p>
      <input type='text' value={message} onChange={(e) => setMessage(e.target.value)} />
      <button onClick={click}>Send Message</button>
      <div>Last received message: {lastJsonMessage && lastJsonMessage.message}</div>
    </div>
  )
}
