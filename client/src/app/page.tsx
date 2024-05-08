import Link from 'next/link'

export default function Home() {
  return (
    <ul>
      <li>
        <Link href={'./sample'}>Sample</Link>
      </li>
      <li>
        <Link href={'./websocket/dashboard'}>Dashboard</Link>
      </li>
    </ul>
  )
}
