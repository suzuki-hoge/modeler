import { createContext } from 'react'
import { SendJsonMessage, WebSocketLike } from 'react-use-websocket/src/lib/types'

import { AddEdgeResponse } from '@/app/socket/message/add-edge'
import { AddMethodResponse } from '@/app/socket/message/add-method'
import { AddNodeResponse } from '@/app/socket/message/add-node'
import { AddPropertyResponse } from '@/app/socket/message/add-property'
import { ConnectResponse } from '@/app/socket/message/connect'
import { DeleteMethodResponse } from '@/app/socket/message/delete-method'
import { DeletePropertyResponse } from '@/app/socket/message/delete-property'
import { DisconnectResponse } from '@/app/socket/message/disconnect'
import { LockResponse } from '@/app/socket/message/lock'
import { UnlockResponse } from '@/app/socket/message/unlock'
import { UpdateIconResponse } from '@/app/socket/message/update-icon'
import { UpdateMethodResponse } from '@/app/socket/message/update-method'
import { UpdateNameResponse } from '@/app/socket/message/update-name'
import { UpdatePropertyResponse } from '@/app/socket/message/update-property'

export type Response =
  | ConnectResponse
  | DisconnectResponse
  | LockResponse
  | UnlockResponse
  | AddNodeResponse
  | AddEdgeResponse
  | AddPropertyResponse
  | UpdateIconResponse
  | UpdateNameResponse
  | UpdatePropertyResponse
  | DeletePropertyResponse
  | AddMethodResponse
  | UpdateMethodResponse
  | DeleteMethodResponse

interface WebSocket {
  send: SendJsonMessage
  response: Response
  socket: () => WebSocketLike | null
}

export const WebSocketContext = createContext<WebSocket | null>(null)
