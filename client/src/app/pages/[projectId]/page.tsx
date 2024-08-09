'use client'
import 'reactflow/dist/style.css'
import Link from 'next/link'
import React from 'react'

import { usePages } from '@/app/_object/page/fetch'

interface Props {
  params: {
    projectId: string
  }
}

export default function Page(props: Props) {
  const [pages, validating] = usePages(props.params.projectId)

  if (validating) {
    return <p>loading...</p>
  }

  return (
    <ul>
      {pages!.map((page) => (
        <li key={page.pageId}>
          <Link href={`/page/${page.projectId}/${page.pageId}`}>{page.name}</Link>
        </li>
      ))}
    </ul>
  )
}
