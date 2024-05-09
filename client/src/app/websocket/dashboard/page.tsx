'use client'

import z from 'zod'

import useWebSocket, { ReadyState } from 'react-use-websocket'
import { type FC, useEffect, useState } from 'react'

import styles from './page.module.scss'

const connectResponse = z.object({
  type: z.string(),
  session_id: z.string(),
  user: z.string(),
})

type ConnectResponse = z.infer<typeof connectResponse>

function isConnectResponse(value: unknown): value is ConnectResponse {
  const json = connectResponse.safeParse(value)
  return json.success && json.data.type === 'connect'
}

const disconnectResponse = z.object({
  type: z.string(),
  session_id: z.string(),
  user: z.string(),
})

type DisconnectResponse = z.infer<typeof disconnectResponse>

function isDisconnectResponse(value: unknown): value is DisconnectResponse {
  const json = disconnectResponse.safeParse(value)
  return json.success && json.data.type === 'disconnect'
}

const lockResponse = z.object({
  type: z.string(),
  object_id: z.string(),
})

type LockResponse = z.infer<typeof lockResponse>

function isLockResponse(value: unknown): value is LockResponse {
  const json = lockResponse.safeParse(value)
  return json.success && json.data.type === 'lock'
}

const unlockResponse = z.object({
  type: z.string(),
  object_id: z.string(),
})

type UnlockResponse = z.infer<typeof unlockResponse>

function isUnlockResponse(value: unknown): value is UnlockResponse {
  const json = unlockResponse.safeParse(value)
  return json.success && json.data.type === 'unlock'
}

interface Props {
  pageId: string
  user: string
}

type Response = ConnectResponse | DisconnectResponse | LockResponse | UnlockResponse

const Session: FC<Props> = (props: Props) => {
  const { sendJsonMessage, lastJsonMessage, getWebSocket } = useWebSocket<Response>(
    `ws://127.0.0.1:8080/ws/${props.pageId}/${props.user}`,
  )
  const [messages, setMessages] = useState<string[]>([])

  useEffect(() => {
    if (lastJsonMessage) {
      if (isConnectResponse(lastJsonMessage)) {
        setMessages((messages) => messages.concat(`${lastJsonMessage.type}: ${lastJsonMessage.user}`).slice(-9))
      }
      if (isDisconnectResponse(lastJsonMessage)) {
        setMessages((messages) => messages.concat(`${lastJsonMessage.type}: ${lastJsonMessage.user}`).slice(-9))
      }
      if (isLockResponse(lastJsonMessage)) {
        setMessages((messages) => messages.concat(`${lastJsonMessage.type}: ${lastJsonMessage.object_id}`).slice(-9))
      }
      if (isUnlockResponse(lastJsonMessage)) {
        setMessages((messages) => messages.concat(`${lastJsonMessage.type}: ${lastJsonMessage.object_id}`).slice(-9))
      }
    }
  }, [lastJsonMessage])

  const lock = () => {
    if (getWebSocket()?.readyState === ReadyState.OPEN) {
      console.log('send lock')
      sendJsonMessage({ type: 'lock', object_id: '1234' })
    } else {
      console.log('already disconnected')
    }
  }
  const unlock = () => {
    if (getWebSocket()?.readyState === ReadyState.OPEN) {
      console.log('send unlock')
      sendJsonMessage({ type: 'unlock', object_id: '1234' })
    } else {
      console.log('already disconnected')
    }
  }
  const disconnect = () => {
    if (getWebSocket()?.readyState === ReadyState.OPEN) {
      console.log('send disconnected')
      getWebSocket()?.close()
    } else {
      console.log('already disconnected')
    }
  }

  return (
    <div className={styles.session}>
      <div className={styles.messages}>
        {messages.map((message, i) => (
          <span key={i}>{message}</span>
        ))}
      </div>
      <div className={styles.buttons}>
        <button onClick={lock}>lock</button>
        <button onClick={unlock}>unlock</button>
        <button onClick={disconnect}>disconnect</button>
      </div>
    </div>
  )
}

// export default function Page({ params }: { params: { pageId: string } }) {
export default function Page() {
  return (
    <>
      <div className={styles.page} style={{ marginBottom: '1rem' }}>
        <span>page 1</span>
        <div className={styles.sessions}>
          <Session pageId={'page1'} user={'user1'} />
          <Session pageId={'page1'} user={'user2'} />
          <Session pageId={'page1'} user={'user3'} />
        </div>
      </div>
      <div className={styles.page}>
        <span>page 2</span>
        <div className={styles.sessions}>
          <Session pageId={'page2'} user={'user4'} />
          <Session pageId={'page2'} user={'user5'} />
          <Session pageId={'page2'} user={'user6'} />
        </div>
      </div>
    </>
  )
}
