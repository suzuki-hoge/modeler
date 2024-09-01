'use client'
import '@xyflow/react/dist/style.css'
import React from 'react'

interface Props {
  params: {
    projectId: string
  }
}

export default function Page(props: Props) {
  return (
    <div>
      <h1>Project ( {props.params.projectId} ): Icons</h1>
      <a href='http://localhost:3000/dashboard'>back</a>
    </div>
  )
}
