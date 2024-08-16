'use client'
import '@xyflow/react/dist/style.css'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

import { fetchProjects } from '@/app/_object/project/fetch'
import { Project } from '@/app/_object/project/type'

export default function Page() {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(
    () => {
      void fetchProjects().then(setProjects)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return (
    <ul>
      {projects.map((project) => (
        <li key={project.projectId}>
          <Link href={`/pages/${project.projectId}`}>{project.name}</Link>
        </li>
      ))}
    </ul>
  )
}
