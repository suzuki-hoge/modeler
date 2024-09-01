'use client'
import '@xyflow/react/dist/style.css'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef } from 'react'

import { useAuthUser } from '@/app/(page)/(auth)/auth'
import { postSignUp } from '@/app/_manage/object/user/request'

export default function Page() {
  const router = useRouter()

  const user = useAuthUser()

  useSingleEffect(() => {
    void postSignUp(user.sub!).then(() => {
      router.push('/dashboard')
    })
  })

  return <p>Loading...</p>
}

const useSingleEffect = (effect: () => void) => {
  const run = useRef(false)

  useEffect(
    () => {
      if (!run.current) {
        effect()
        run.current = true
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
}
