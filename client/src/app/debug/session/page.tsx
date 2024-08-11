'use client'
import * as crypto from 'crypto'

import '@xyflow/react/dist/style.css'
import axios from 'axios'
import Link from 'next/link'
import React from 'react'
import useSWR from 'swr'

import styles from './page.module.scss'

export default function Page() {
  const [data, validating] = useDebugSession(false)

  if (validating) {
    return <p>loading...</p>
  }

  return (
    <div className={styles.component}>
      {data!.projects.map((project) => (
        <div key={project.projectId} className={styles.project}>
          <span>
            <Link href={`/pages/${project.projectId}`}>
              {shorten(project.projectId)}: {project.name}
            </Link>
          </span>
          <div className={styles.sessions}>
            {(data!.sessions.projectSessions[project.projectId] || []).map((sessionId) => (
              <div key={sessionId} className={styles.session} style={{ backgroundColor: hashedColor(sessionId) }}>
                {shorten(sessionId)}: {data!.sessions.users[sessionId]}
              </div>
            ))}
          </div>
          {project.pages.map((page) => (
            <div key={page.pageId} className={styles.page}>
              <span>
                <Link href={`/page/${project.projectId}/${page.pageId}`}>
                  {shorten(page.pageId)}: {page.name}
                </Link>
              </span>
              <div className={styles.sessions}>
                {(data!.sessions.pageSessions[page.pageId] || []).map((sessionId) => (
                  <div key={sessionId} className={styles.session} style={{ backgroundColor: hashedColor(sessionId) }}>
                    {shorten(sessionId)}: {data!.sessions.users[sessionId]}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

interface DebugSession {
  projects: Array<{
    projectId: string
    name: string
    pages: Array<{
      pageId: string
      name: string
    }>
  }>
  sessions: {
    projectSessions: Record<string, string[]>
    pageSessions: Record<string, string[]>
    users: Record<string, string>
  }
}

function shorten(s: string): string {
  return s.split('-')[0]
}

function useDebugSession(isMock: boolean): [DebugSession | undefined, boolean] {
  const url = `http://localhost:8080/debug/session`

  const { data, isValidating } = useSWR<DebugSession>(url, (url: string) =>
    axios.get<DebugSession>(url).then((res) => res.data),
  )

  return isMock ? [mock, false] : [data, isValidating]
}

const mock: DebugSession = {
  projects: [
    {
      name: 'プロジェクト１',
      pages: [
        {
          name: 'クラス図１',
          pageId: '3313e913-b0ab-4e3b-a35f-f1cf8ab625e1',
        },
        {
          name: 'クラス図２',
          pageId: '1c672dc5-6951-4712-a345-86f60f28a7b2',
        },
      ],
      projectId: '7c6174a1-d573-443b-bfd5-e918bfeffd39',
    },
    {
      name: 'プロジェクト２',
      pages: [
        {
          name: 'クラス図３',
          pageId: '36663da0-42d9-49aa-8326-babfa166cc7f',
        },
        {
          name: 'クラス図４',
          pageId: 'cc702f17-fdc1-45c5-a1a6-8b7cddf6b017',
        },
      ],
      projectId: '3ac1ccff-fc6c-46fb-9aa3-ab0236875160',
    },
  ],
  sessions: {
    pageSessions: {
      '1c672dc5-6951-4712-a345-86f60f28a7b2': ['439e4cd2-b237-4894-bb7b-a500fc6de8c6'],
      '3313e913-b0ab-4e3b-a35f-f1cf8ab625e1': [
        'ee7ea767-d891-4657-86c7-b9f24a5d92f8',
        'a53e4cdb-e866-4dff-b47c-986226d87432',
        '2544f437-2cb6-4f16-9773-03b36963e6f9',
      ],
      'cc702f17-fdc1-45c5-a1a6-8b7cddf6b017': ['f91d39dd-b090-4acd-b04a-d61df8ac80f9'],
    },
    projectSessions: {
      '3ac1ccff-fc6c-46fb-9aa3-ab0236875160': ['f91d39dd-b090-4acd-b04a-d61df8ac80f9'],
      '7c6174a1-d573-443b-bfd5-e918bfeffd39': [
        'ee7ea767-d891-4657-86c7-b9f24a5d92f8',
        'a53e4cdb-e866-4dff-b47c-986226d87432',
        '439e4cd2-b237-4894-bb7b-a500fc6de8c6',
        '2544f437-2cb6-4f16-9773-03b36963e6f9',
      ],
    },
    users: {
      '2544f437-2cb6-4f16-9773-03b36963e6f9': 'Delpha',
      '439e4cd2-b237-4894-bb7b-a500fc6de8c6': 'Narciso',
      'a53e4cdb-e866-4dff-b47c-986226d87432': 'Duane',
      'ee7ea767-d891-4657-86c7-b9f24a5d92f8': 'Eve',
      'f91d39dd-b090-4acd-b04a-d61df8ac80f9': 'Keely',
    },
  },
}

function hashedColor(uuid: string): string {
  const hash = crypto.createHash('md5').update(uuid).digest('hex')

  let r = parseInt(hash.slice(0, 2), 16)
  let g = parseInt(hash.slice(2, 4), 16)
  let b = parseInt(hash.slice(2, 4), 16)

  r = Math.min(255, Math.floor(r + (255 - r) * 0.7))
  g = Math.min(255, Math.floor(g + (255 - g) * 0.7))
  b = Math.min(255, Math.floor(b + (255 - b) * 0.7))

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
