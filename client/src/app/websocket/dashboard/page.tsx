'use client'

import useWebSocket from 'react-use-websocket'
import { type FC, useEffect, useState } from 'react'

import styles from './page.module.scss'
import { ConnectResponse, handleConnectResponse } from '@/app/websocket/dashboard/(message)/connect'
import {
  DisconnectResponse,
  handleDisconnectResponse,
  sendDisconnectRequest,
} from '@/app/websocket/dashboard/(message)/disconnect'
import { handleLockResponse, LockResponse, sendLockRequest } from '@/app/websocket/dashboard/(message)/lock'
import { handleUnlockResponse, sendUnlockRequest, UnlockResponse } from '@/app/websocket/dashboard/(message)/unlock'
import {
  AddNodeResponse,
  handleAddNodeResponse,
  sendAddNodeRequest,
} from '@/app/websocket/dashboard/(message)/add-node'
import {
  AddEdgeResponse,
  handleAddEdgeResponse,
  sendAddEdgeRequest,
} from '@/app/websocket/dashboard/(message)/add-edge'

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
      handleConnectResponse(lastJsonMessage, setMessages)
      handleDisconnectResponse(lastJsonMessage, setMessages)
      handleLockResponse(lastJsonMessage, setMessages)
      handleUnlockResponse(lastJsonMessage, setMessages)
      handleAddNodeResponse(lastJsonMessage, setMessages)
      handleAddEdgeResponse(lastJsonMessage, setMessages)
    }
  }, [lastJsonMessage])

  return (
    <div className={styles.session}>
      <div className={styles.messages}>
        {messages.map((message, i) => (
          <span key={i}>{message}</span>
        ))}
      </div>
      <div className={styles.buttons}>
        <button onClick={() => sendLockRequest(sendJsonMessage, getWebSocket)}>lock</button>
        <button onClick={() => sendUnlockRequest(sendJsonMessage, getWebSocket)}>unlock</button>
        <button onClick={() => sendAddNodeRequest(sendJsonMessage, getWebSocket)}>addNode</button>
        <button onClick={() => sendAddEdgeRequest(sendJsonMessage, getWebSocket)}>addEdge</button>
        <button onClick={() => sendDisconnectRequest(sendJsonMessage, getWebSocket)}>disconnect</button>
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
