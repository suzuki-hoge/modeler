'use client'
import 'reactflow/dist/style.css'

import React from 'react'

import { CharIcon } from '@/app/_component/icon/char-icon/CharIcon'
import { Selector } from '@/app/_component/input/popup-selector/Selector'

export default function Page() {
  return (
    <div>
      <Selector
        choices={[
          { name: 'UC', desc: 'UseCase', color: 'lightcyan' },
          { name: 'D', desc: 'Domain', color: 'lightgreen' },
        ]}
        preview={(option) => (
          <>
            <CharIcon char={option.name} color={option.color} />
            {option.desc}
          </>
        )}
        search={['name', 'desc']}
        onSelect={console.log}
        setActive={() => {}}
      />
    </div>
  )
}
