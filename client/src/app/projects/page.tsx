'use client'
import 'reactflow/dist/style.css'
import Link from 'next/link'
import React from 'react'

import { useProjects } from '@/app/_object/project/fetch'

export default function Page() {
  const [projects, validating] = useProjects()

  if (validating) {
    return <p>loading...</p>
  }

  return (
    <ul>
      {projects!.map((project) => (
        <li key={project.projectId}>
          <Link href={`/pages/${project.projectId}`}>{project.name}</Link>
        </li>
      ))}
    </ul>
  )
}
