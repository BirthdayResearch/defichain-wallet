import * as React from 'react'
import { BalanceSkeletonLoader } from '../screens/AppNavigator/screens/Balances/screens/BalanceSkeletonLoader'
import { DexSkeletonLoader } from '../screens/AppNavigator/screens/Dex/screens/DexSkeletonLoader'

interface SkeletonLoaderProp {
  row: number
  screen: SkeletonLoaderScreen
}

export enum SkeletonLoaderScreen {
  'Balance' = 'Balance',
  'Dex' = 'Dex'
}

export function SkeletonLoader (prop: SkeletonLoaderProp): JSX.Element {
  const skeletonRow = Array.from(Array(prop.row), (_v, i) => i + 1)

  switch (prop.screen) {
    case SkeletonLoaderScreen.Balance:
      return (
        <>
          {skeletonRow.map(i => (
            <BalanceSkeletonLoader key={i} />
          ))}
        </>
      )

    case SkeletonLoaderScreen.Dex:
      return (
        <>
          {skeletonRow.map(i => (
            <DexSkeletonLoader key={i} />
          ))}
        </>
      )
  }
}
