'use client'
import '@xyflow/react/dist/style.css'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

import { fetchProjectPages } from '@/app/_object/page/fetch'
import { Page as PageType } from '@/app/_object/page/type'

interface Props {
  params: {
    projectId: string
  }
}

export default function Page(props: Props) {
  const [pages, setPages] = useState<PageType[]>([])

  useEffect(
    () => {
      void fetchProjectPages(props.params.projectId).then(setPages)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return (
    <ul>
      {pages.map((page) => (
        <li key={page.pageId}>
          <Link href={`/page/${page.projectId}/${page.pageId}`}>{page.name}</Link>
        </li>
      ))}
    </ul>
  )
}
