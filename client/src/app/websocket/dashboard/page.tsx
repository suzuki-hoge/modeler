'use client'

import useWebSocket, { ReadyState } from 'react-use-websocket'
import { type FC, useEffect, useState } from 'react'

import styles from './page.module.scss'

interface Message {
  kind: string
  message: string
}

interface Props {
  pageId: string
}

const Session: FC<Props> = (props: Props) => {
  const { sendJsonMessage, lastJsonMessage, getWebSocket } = useWebSocket<Message>(
    `ws://127.0.0.1:8080/ws/${props.pageId}`,
  )
  const [messages, setMessages] = useState<string[]>([])

  useEffect(() => {
    if (lastJsonMessage)
      setMessages((messages) => messages.concat(`${lastJsonMessage.message} ( ${lastJsonMessage.kind} )`).slice(-9))
  }, [lastJsonMessage])

  const lock = () => {
    if (getWebSocket()?.readyState === ReadyState.OPEN) {
      console.log('send lock')
      sendJsonMessage({ kind: 'lock', message: '1234' })
    } else {
      console.log('already disconnected')
    }
  }
  const unlock = () => {
    if (getWebSocket()?.readyState === ReadyState.OPEN) {
      console.log('send unlock')
      sendJsonMessage({ kind: 'unlock', message: '1234' })
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
          <Session pageId={'page1'} />
          <Session pageId={'page1'} />
          <Session pageId={'page1'} />
        </div>
      </div>
      <div className={styles.page}>
        <span>page 2</span>
        <div className={styles.sessions}>
          <Session pageId={'page2'} />
          <Session pageId={'page2'} />
          <Session pageId={'page2'} />
        </div>
      </div>
    </>
  )
}
