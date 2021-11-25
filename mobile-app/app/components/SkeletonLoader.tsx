import * as React from 'react'
import { DexSkeletonLoader } from './skeletonLoaders/DexSkeletonLoader'
import { MnemonicWordSkeletonLoader } from './skeletonLoaders/MnemonicWordSkeletonLoader'
import { TransactionSkeletonLoader } from './skeletonLoaders/TransactionSkeletonLoader'
import { LoanSkeletonLoader } from './skeletonLoaders/LoanSkeletonLoader'
import { VaultSkeletonLoader } from './skeletonLoaders/VaultSkeletonLoader'

interface SkeletonLoaderProp {
  row: number
  screen: SkeletonLoaderScreen
}

export enum SkeletonLoaderScreen {
  'Dex' = 'Dex',
  'Transaction' = 'Transaction',
  'MnemonicWord' = 'MnemonicWord',
  'Loan' = 'Loan',
  'Vault' = 'Vault'
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
    case SkeletonLoaderScreen.Loan:
      return (
        <>
          {skeletonRow.map(i => (
            <LoanSkeletonLoader key={i} />
          ))}
        </>
      )
    case SkeletonLoaderScreen.Vault:
      return (
        <>
          {skeletonRow.map(i => (
            <VaultSkeletonLoader key={i} />
          ))}
        </>
      )
  }
}
