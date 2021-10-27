import * as React from 'react'
import { tailwind } from '@tailwind'
import BigNumber from 'bignumber.js'
import { ThemedView } from '@components/themed'
import { VaultCard, VaultCardProps, VaultStatus } from '@components/VaultCard'

export function Vaults (): JSX.Element {
  // TODO(pierregee): Remove hardcoded vaults once API is ready
  const vaults: VaultCardProps[] = [
    {
      vaultAddress: '22ffasd5ca123123123123123121231061',
      status: VaultStatus.Locked,
      collaterals: ['BTC', 'DFI', 'dETH', 'dLTC', 'dLTC'],
      activeLoans: new BigNumber(3),
      totalLoanAmount: new BigNumber('50000'),
      collateralAmount: new BigNumber('40000'),
      collateralRatio: new BigNumber('80'),
      actions: ['ADD_COLLATERAL', 'VIEW_LOANS'],
      onArrowPress: () => {}
    },
    {
      vaultAddress: '22ffasd5ca123123123123123121231061',
      status: VaultStatus.AtRisk,
      collaterals: ['BTC', 'DFI'],
      activeLoans: new BigNumber(3),
      totalLoanAmount: new BigNumber('50000000000000000000'),
      collateralAmount: new BigNumber('40000'),
      collateralRatio: new BigNumber('150'),
      actions: [],
      onArrowPress: () => {}
    }
  ]

  return (
    <ThemedView style={tailwind('h-full m-4')}>
      {vaults.map((vault, index) => {
        return <VaultCard key={index} {...vault} />
      })}
    </ThemedView>
  )
}
