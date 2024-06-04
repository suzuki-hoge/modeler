'use client'

export interface Props {
  s: string
}

export const Foo = (props: Props) => {
  return <p>{props.s}</p>
}
