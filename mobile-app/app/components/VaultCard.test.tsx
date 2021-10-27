import React from 'react'
import { VaultCard, VaultStatus } from './VaultCard'
import BigNumber from 'bignumber.js'
import { render } from '@testing-library/react-native'

jest.mock('../contexts/ThemeProvider')

describe('Vault card', () => {
  it('should match snapshot of locked vault', async () => {
    const lockedVault = {
      vaultAddress: '22ffasd5ca123123123123123121231061',
      status: VaultStatus.Locked,
      collaterals: ['BTC', 'DFI', 'dETH', 'dLTC', 'dLTC'],
      activeLoans: new BigNumber(3),
      totalLoanAmount: new BigNumber('50000'),
      collateralAmount: new BigNumber('40000'),
      collateralRatio: new BigNumber('80'),
      actions: ['ADD_COLLATERAL', 'VIEW_LOANS'],
      onArrowPress: () => jest.fn
    }
    const rendered = render(<VaultCard {...lockedVault} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should match snapshot of at-risk vault', async () => {
    const atRiskVault = {
      vaultAddress: '22ffasd5ca123123123123123121231061',
      status: VaultStatus.AtRisk,
      collaterals: ['BTC', 'DFI'],
      activeLoans: new BigNumber(3),
      totalLoanAmount: new BigNumber('50000000000000000000'),
      collateralAmount: new BigNumber('40000'),
      collateralRatio: new BigNumber('150'),
      actions: [],
      onArrowPress: () => jest.fn
    }
    const rendered = render(<VaultCard {...atRiskVault} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should match snapshot of safe vault', async () => {
    const safeVault = {
      vaultAddress: '22ffasd5ca123123123123123121231061',
      status: VaultStatus.Safe,
      collaterals: ['dETH', 'BTC', 'DFI', 'dLTC', 'dLTC', 'dLTC', 'dLTC'],
      activeLoans: new BigNumber(3),
      totalLoanAmount: new BigNumber('50000'),
      collateralAmount: new BigNumber('40000'),
      collateralRatio: new BigNumber('300'),
      actions: ['ADD_COLLATERAL'],
      onArrowPress: () => jest.fn
    }
    const rendered = render(<VaultCard {...safeVault} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should match snapshot of new vault', async () => {
    const newVault = {
      vaultAddress: '22ffasd5ca123123123123123121231061',
      status: VaultStatus.New,
      collaterals: [],
      actions: ['ADD_COLLATERAL'],
      onArrowPress: () => jest.fn
    }
    const rendered = render(<VaultCard {...newVault} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
