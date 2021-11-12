import React from 'react'
import { VaultCard, VaultStatus, VaultCardProps } from './VaultCard'
import BigNumber from 'bignumber.js'
import { render } from '@testing-library/react-native'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn()
}))

describe('Vault card', () => {
  it('should match snapshot of locked vault', async () => {
    const lockedVault: VaultCardProps = {
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
    }
    const rendered = render(<VaultCard {...lockedVault} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should match snapshot of at-risk vault', async () => {
    const atRiskVault: VaultCardProps = {
      vaultAddress: '22ffasd5ca123123123123123121231061',
      status: VaultStatus.AtRisk,
      collaterals: [
        { id: 'BTC', vaultProportion: new BigNumber(20) },
        { id: 'DFI', vaultProportion: new BigNumber(12.4573) },
        { id: 'dETH', vaultProportion: new BigNumber(55.123333) },
        { id: 'dLTC', vaultProportion: new BigNumber(20) },
        { id: 'dUSDC', vaultProportion: new BigNumber(20) }
      ],
      activeLoans: [{ tokenId: 'BTC' }, { tokenId: 'DFI' }, { tokenId: 'dETH' }],
      totalLoanAmount: new BigNumber('50000000000000000000'),
      collateralAmount: new BigNumber('40000'),
      collateralRatio: new BigNumber('150'),
      actions: []
    }
    const rendered = render(<VaultCard {...atRiskVault} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should match snapshot of safe vault', async () => {
    const safeVault: VaultCardProps = {
      vaultAddress: '22ffasd5ca123123123123123121231061',
      status: VaultStatus.Safe,
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
      collateralRatio: new BigNumber('300'),
      actions: ['ADD_COLLATERAL']
    }
    const rendered = render(<VaultCard {...safeVault} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should match snapshot of new vault', async () => {
    const newVault: VaultCardProps = {
      vaultAddress: '22ffasd5ca123123123123123121231061',
      status: VaultStatus.New,
      collaterals: [],
      actions: ['ADD_COLLATERAL']
    }
    const rendered = render(<VaultCard {...newVault} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
