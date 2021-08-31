import * as React from 'react'
import { DexSkeletonLoader } from './skeletonLoaders/DexSkeletonLoader'
import { TransactionSkeletonLoader } from './skeletonLoaders/TransactionSkeletonLoader'
import { MnemonicWordSkeletonLoader } from './skeletonLoaders/MnemonicWordSkeletonLoader'

interface SkeletonLoaderProp {
  row: number
  screen: SkeletonLoaderScreen
}

export enum SkeletonLoaderScreen {
  'Dex' = 'Dex',
  'Transaction' = 'Transaction',
  'MnemonicWord' = 'MnemonicWord'
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
    case SkeletonLoaderScreen.MnemonicWord:
      return (
        <>
          {skeletonRow.map(i => (
            <MnemonicWordSkeletonLoader key={i} />
          ))}
        </>
      )
  }
}
