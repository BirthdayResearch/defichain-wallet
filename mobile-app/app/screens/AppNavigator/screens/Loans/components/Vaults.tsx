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
      collaterals: [
        { id: 'BTC', vaultProportion: new BigNumber(20) },
        { id: 'DFI', vaultProportion: new BigNumber(12.4573) },
        { id: 'dETH', vaultProportion: new BigNumber(55.123333) },
        { id: 'dLTC', vaultProportion: new BigNumber(20) },
        { id: 'dUSDC', vaultProportion: new BigNumber(20) }
      ],
      activeLoans: [{ tokenId: 'BTC' }, { tokenId: 'DFI' }, { tokenId: 'dETH' }],
      totalLoanAmount: new BigNumber('50000'),
      collateralAmount: new BigNumber('40000'),
      collateralRatio: new BigNumber('80'),
      actions: ['ADD_COLLATERAL', 'VIEW_LOANS']
    },
    {
      vaultAddress: '22ffasd5ca123123123123123121231061',
      status: VaultStatus.AtRisk,
      collaterals: [
        { id: 'BTC', vaultProportion: new BigNumber(20) },
        { id: 'DFI', vaultProportion: new BigNumber(12.4573) }
      ],
      activeLoans: [{ tokenId: 'BTC' }, { tokenId: 'DFI' }, { tokenId: 'dETH' }, { tokenId: 'dLTC' }, { tokenId: 'dDOGE' }, { tokenId: 'dUSDC' }, { tokenId: 'dBCH' }],
      totalLoanAmount: new BigNumber('50000000000000000000'),
      collateralAmount: new BigNumber('40000'),
      collateralRatio: new BigNumber('150'),
      actions: []
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
