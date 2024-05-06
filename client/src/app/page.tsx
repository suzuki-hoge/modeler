import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Link href={'./sample'}>Sample</Link>
      <Link href={'./poc'}>PoC</Link>
    </>
  )
}
