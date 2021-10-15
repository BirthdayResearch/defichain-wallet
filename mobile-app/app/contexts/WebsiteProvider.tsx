import React from 'react'

export function StatsProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  return (
    <>
      {props.children}
    </>
  )
}
