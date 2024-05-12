import { createContext } from 'react'
import { SendJsonMessage, WebSocketLike } from 'react-use-websocket/src/lib/types'

import { AddEdgeResponse } from '@/app/page/[pageId]/message/add-edge'
import { AddNodeResponse } from '@/app/page/[pageId]/message/add-node'
import { ConnectResponse } from '@/app/page/[pageId]/message/connect'
import { DisconnectResponse } from '@/app/page/[pageId]/message/disconnect'
import { LockResponse } from '@/app/page/[pageId]/message/lock'
import { UnlockResponse } from '@/app/page/[pageId]/message/unlock'

export type Response =
  | ConnectResponse
  | DisconnectResponse
  | LockResponse
  | UnlockResponse
  | AddNodeResponse
  | AddEdgeResponse

interface WebSocket {
  send: SendJsonMessage
  response: Response
  socket: () => WebSocketLike | null
}

export const WebSocketContext = createContext<WebSocket | null>(null)
