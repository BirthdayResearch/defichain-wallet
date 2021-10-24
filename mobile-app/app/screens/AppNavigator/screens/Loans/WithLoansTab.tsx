import React, { ReactElement } from 'react'
import { Tabs } from '@components/Tabs'

const tabSections = [{
  label: 'Browse loans',
  isActive: true,
  disabled: false,
  handleOnPress: () => {}
}, {
  label: 'Your vaults',
  isActive: false,
  disabled: false,
  handleOnPress: () => {}
}]

export function LoansTab ({ children }: {children: ReactElement}): JSX.Element {
  return (
    <>
      <Tabs tabSections={tabSections} />
      {children}
    </>
  )
}
