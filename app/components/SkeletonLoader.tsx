import * as React from 'react'
import { DexSkeletonLoader } from '../screens/AppNavigator/screens/Dex/screens/DexSkeletonLoader'
import { TransactionSkeletonLoader } from '../screens/AppNavigator/screens/Transactions/screens/TransactionSkeletonLoader'

interface SkeletonLoaderProp {
  row: number
  screen: SkeletonLoaderScreen
}

export enum SkeletonLoaderScreen {
  'Dex' = 'Dex',
  'Transaction' = 'Transaction'
}

export function SkeletonLoader (prop: SkeletonLoaderProp): JSX.Element {
  const skeletonRow = Array.from(Array(prop.row), (_v, i) => i + 1)

  switch (prop.screen) {
    case SkeletonLoaderScreen.Dex:
      return (
        <>
          {skeletonRow.map(i => (
            <DexSkeletonLoader key={i} />
          ))}
        </>
      )

    case SkeletonLoaderScreen.Transaction:
      return (
        <>
          {skeletonRow.map(i => (
            <TransactionSkeletonLoader key={i} />
          ))}
        </>
      )
  }
}
