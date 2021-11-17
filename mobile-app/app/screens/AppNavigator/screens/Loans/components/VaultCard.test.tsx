import React from 'react'
import { VaultCard, VaultCardProps } from './VaultCard'
import { render } from '@testing-library/react-native'
import { LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn()
}))

describe('Vault card', () => {
  it('should match snapshot of liquidated vault', async () => {
    const lockedVault: VaultCardProps = {
      vault: {
        vaultId: '22ffasd5ca123123123123123121231061',
        loanScheme: {
          id: '0',
          interestRate: '3',
          minColRatio: '100'
        },
        ownerAddress: 'bcrt1qxzj8pnkeqznvx6xgeepdywus8lkxq3vvmeccyt',
        state: LoanVaultState.IN_LIQUIDATION,
        batches: [],
        batchCount: 0,
        liquidationHeight: 0,
        liquidationPenalty: 0
      }
    }
    const rendered = render(<VaultCard vault={lockedVault.vault} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should match snapshot of at-risk vault', async () => {
    const atRiskVault: VaultCardProps = {
      vault: {
        vaultId: '22ffasd5ca123123123123123121231061',
        loanAmounts: [],
        collateralRatio: '',
        collateralValue: '',
        collateralAmounts: [],
        loanScheme: {
          id: '0',
          interestRate: '3',
          minColRatio: '100'
        },
        loanValue: '100',
        ownerAddress: 'bcrt1qxzj8pnkeqznvx6xgeepdywus8lkxq3vvmeccyt',
        state: LoanVaultState.MAY_LIQUIDATE,
        informativeRatio: '0',
        interestAmounts: [],
        interestValue: '1'
      }
    }
    const rendered = render(<VaultCard {...atRiskVault} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should match snapshot of healthy vault', async () => {
    const safeVault: VaultCardProps = {
      vault: {
        vaultId: '22ffasd5ca123123123123123121231061',
        loanAmounts: [],
        collateralRatio: '',
        collateralValue: '',
        collateralAmounts: [],
        loanScheme: {
          id: '0',
          interestRate: '3',
          minColRatio: '100'
        },
        loanValue: '100',
        ownerAddress: 'bcrt1qxzj8pnkeqznvx6xgeepdywus8lkxq3vvmeccyt',
        state: LoanVaultState.ACTIVE,
        informativeRatio: '0',
        interestAmounts: [],
        interestValue: '1'
      }
    }
    const rendered = render(<VaultCard vault={safeVault.vault} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should match snapshot of active vault', async () => {
    const newVault: VaultCardProps = {
      vault: {
        vaultId: '22ffasd5ca123123123123123121231061',
        loanAmounts: [],
        collateralRatio: '',
        collateralValue: '',
        collateralAmounts: [],
        loanScheme: {
          id: '0',
          interestRate: '3',
          minColRatio: '100'
        },
        loanValue: '100',
        ownerAddress: 'bcrt1qxzj8pnkeqznvx6xgeepdywus8lkxq3vvmeccyt',
        state: LoanVaultState.ACTIVE,
        informativeRatio: '0',
        interestAmounts: [],
        interestValue: '1'
      }
    }
    const rendered = render(<VaultCard vault={newVault.vault} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
