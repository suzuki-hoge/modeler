'use client'
import 'reactflow/dist/style.css'
import React from 'react'

import { usePageEdges, useProjectEdges } from '@/app/_object/edge/fetch'
import { useNodeIcons, usePageNodes, useProjectNodes } from '@/app/_object/node/fetch'

export default function Page() {
  const [icons1, isValidating1] = useNodeIcons('1')
  const [nodes1, isValidating2] = useProjectNodes('1')
  const [edges1, isValidating3] = useProjectEdges('1')
  const [nodes2, isValidating4] = usePageNodes('1', '1')
  const [edges2, isValidating5] = usePageEdges('1', '1')

  return (
    <div>
      {isValidating1 ? <p>loading...</p> : <p>{JSON.stringify(icons1)}</p>}
      {isValidating2 ? <p>loading...</p> : <p>{JSON.stringify(nodes1)}</p>}
      {isValidating3 ? <p>loading...</p> : <p>{JSON.stringify(edges1)}</p>}
      {isValidating4 ? <p>loading...</p> : <p>{JSON.stringify(nodes2)}</p>}
      {isValidating5 ? <p>loading...</p> : <p>{JSON.stringify(edges2)}</p>}
    </div>
  )
}
