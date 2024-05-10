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

const addNodeResponse = z.object({
  type: z.string(),
  object_id: z.string(),
  x: z.number(),
  y: z.number(),
})

type AddNodeResponse = z.infer<typeof addNodeResponse>

function isAddNodeResponse(value: unknown): value is AddNodeResponse {
  const json = addNodeResponse.safeParse(value)
  return json.success && json.data.type === 'add-node'
}

const addEdgeResponse = z.object({
  type: z.string(),
  object_id: z.string(),
  src: z.string(),
  dst: z.string(),
})

type AddEdgeResponse = z.infer<typeof addEdgeResponse>

function isAddEdgeResponse(value: unknown): value is AddEdgeResponse {
  const json = addEdgeResponse.safeParse(value)
  return json.success && json.data.type === 'add-edge'
}

interface Props {
  pageId: string
  user: string
}

type Response = ConnectResponse | DisconnectResponse | LockResponse | UnlockResponse | AddNodeResponse | AddEdgeResponse

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
      if (isAddNodeResponse(lastJsonMessage)) {
        setMessages((messages) =>
          messages
            .concat(
              `${lastJsonMessage.type}: ${lastJsonMessage.object_id} ( ${lastJsonMessage.x}, ${lastJsonMessage.y} )`,
            )
            .slice(-9),
        )
      }
      if (isAddEdgeResponse(lastJsonMessage)) {
        setMessages((messages) =>
          messages
            .concat(
              `${lastJsonMessage.type}: ${lastJsonMessage.object_id} ( ${lastJsonMessage.src} -> ${lastJsonMessage.dst} )`,
            )
            .slice(-9),
        )
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
  const addNode = () => {
    if (getWebSocket()?.readyState === ReadyState.OPEN) {
      console.log('send add-node')
      sendJsonMessage({ type: 'add-node', x: 12, y: 34 })
    } else {
      console.log('already disconnected')
    }
  }
  const addEdge = () => {
    if (getWebSocket()?.readyState === ReadyState.OPEN) {
      console.log('send add-edge')
      sendJsonMessage({ type: 'add-edge', src: 'ab', dst: 'cd' })
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
        <button onClick={addNode}>addNode</button>
        <button onClick={addEdge}>addEdge</button>
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
