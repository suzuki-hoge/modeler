'use client'
import '@xyflow/react/dist/style.css'
import React from 'react'

export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>

      <h2>Project ( 123 )</h2>
      <ul>
        <li>
          <a href='http://localhost:3000/123/abc'>Page ( abc )</a>
        </li>
        <li>
          <a href='http://localhost:3000/123/def'>Page ( def )</a>
        </li>
        <li>
          <a href='http://localhost:3000/123/icons'>Icons</a>
        </li>
        <li>
          <a href='http://localhost:3000/123/templates'>Templates</a>
        </li>
        <li>
          <a href='http://localhost:3000/123/nodes'>Nodes</a>
        </li>
        <li>
          <a href='http://localhost:3000/123/join/871526'>Join</a>
        </li>
      </ul>

      <h2>Project ( 456 )</h2>
      <ul>
        <li>
          <a href='http://localhost:3000/456/ghi'>Page ( ghi )</a>
        </li>
        <li>
          <a href='http://localhost:3000/456/jkl'>Page ( jkl )</a>
        </li>
        <li>
          <a href='http://localhost:3000/456/icons'>Icons</a>
        </li>
        <li>
          <a href='http://localhost:3000/456/templates'>Templates</a>
        </li>
        <li>
          <a href='http://localhost:3000/456/nodes'>Nodes</a>
        </li>
        <li>
          <a href='http://localhost:3000/456/join/425971'>Join</a>
        </li>
      </ul>
    </div>
  )
}
