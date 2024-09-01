'use client'
import { Auth0Provider } from '@auth0/auth0-react'
import { User } from '@auth0/auth0-spa-js'
import React, { ReactElement, useEffect, useState } from 'react'

import { useAuth } from '@/app/(page)/(auth)/auth'

interface Props {
  children: ReactElement<{ user: User } & Record<string, unknown>>
}

export default function Layout(props: Props) {
  const [origin, setOrigin] = useState('')

  useEffect(
    () => {
      setOrigin(`${window.location.origin}/auth/callback`)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  if (origin === '') {
    return <p>Loading...</p>
  }

  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH_DOMAIN!}
      clientId={process.env.NEXT_PUBLIC_AUTH_CLIENT_ID!}
      authorizationParams={{ redirect_uri: origin }}
    >
      <AuthPage>{props.children}</AuthPage>
    </Auth0Provider>
  )
}

function AuthPage(props: Props) {
  const { isLoading, isAuthenticated, user, loginWithRedirect, logout } = useAuth()

  if (isLoading) {
    return <p>Loading...</p>
  }

  if (!isLoading && !isAuthenticated) {
    void loginWithRedirect()
    return <></>
  }

  const w1 = (): void => {
    loginWithRedirect().catch(console.log)
  }
  const w2 = (): void => {
    logout().catch(console.log)
  }

  return (
    <div>
      {isAuthenticated && user ? (
        <div>
          <img src={user.picture} alt={user.sub} />
          {React.cloneElement(props.children, { user: user })}
        </div>
      ) : (
        <p>----</p>
      )}
      <button onClick={w1}>Log in</button>
      <button onClick={w2}>Log out</button>
    </div>
  )
}
