'use client'
import 'reactflow/dist/style.css'

import React from 'react'

import { CompletableInput } from '@/app/component/completable-input/CompletableInput'

export default function Page() {
  return <CompletableInput inner={'foo(a: ref#123#, b: ref#456#)'} />
}