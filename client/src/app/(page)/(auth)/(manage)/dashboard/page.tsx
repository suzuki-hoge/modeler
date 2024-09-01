'use client'
import '@xyflow/react/dist/style.css'
import React, { useEffect, useState } from 'react'

import { useAuthUser } from '@/app/(page)/(auth)/auth'
import { Page } from '@/app/_manage/object/page/type'
import { Project } from '@/app/_manage/object/project/type'
import { getUserProjectPages, postCreateUserProjectPage } from '@/app/_manage/object/user-project-page/request'
import { UserProjectPage } from '@/app/_manage/object/user-project-page/type'

export default function Content() {
  const user = useAuthUser()

  const [projectPages, setProjectPages] = useState<UserProjectPage[]>([])

  useEffect(
    () => {
      void getUserProjectPages(user.sub!).then(setProjectPages)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const createNewProject = () =>
    void postCreateUserProjectPage(user.sub!, 'プロジェクト１', 'ページ１').then(() =>
      getUserProjectPages(user.sub!).then(setProjectPages),
    )

  return (
    <div>
      <h1>Dashboard</h1>
      {toDistinctSortedGroups(projectPages).map((group) => (
        <div key={group.project.projectId}>
          <h2 key={group.project.projectId}>{group.project.name}</h2>
          <ul>
            {group.pages.map((page) => (
              <li key={page.pageId}>
                <a href={`./${group.project.projectId}/${page.pageId}`}>{page.name}</a>
              </li>
            ))}
          </ul>
          <ul>
            <li>
              <a href={`./${group.project.projectId}/icons`}>icons</a>
            </li>
            <li>
              <a href={`./${group.project.projectId}/templates`}>templates</a>
            </li>
            <li>
              <a href={`./${group.project.projectId}/nodes`}>nodes</a>
            </li>
            <li>
              <a href={`./${group.project.projectId}/join/abc`}>join</a>
            </li>
          </ul>
        </div>
      ))}
      <button onClick={createNewProject}>Create New Project</button>
    </div>
  )
}

function toDistinctSortedGroups(projectPages: UserProjectPage[]): { project: Project; pages: Page[] }[] {
  const projects = distinct(
    projectPages.map((projectPage) => ({
      projectId: projectPage.projectId,
      name: projectPage.projectName,
    })),
  ).sort((p1, p2) => p1.name.localeCompare(p2.name))
  const groupedPages = groupBy(projectPages)
  return projects.map((project) => ({
    project,
    pages: groupedPages[project.projectId].sort((p1, p2) => p1.name.localeCompare(p2.name)),
  }))
}

const groupBy = (projectPages: UserProjectPage[]): Record<string, Page[]> => {
  return projectPages.reduce(
    (acc, projectPage) => {
      const key = projectPage['projectId'] as unknown as string
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push({ pageId: projectPage.pageId, name: projectPage.pageName })
      return acc
    },
    {} as Record<string, Page[]>,
  )
}

function distinct(projects: Project[]): Project[] {
  const ids = Array.from(new Set(projects.map((projects) => projects.projectId)))
  return ids.map((id) => projects.find((project) => project.projectId === id)!)
}
