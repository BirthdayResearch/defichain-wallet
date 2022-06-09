
import { VaultCard, VaultCardProps } from './VaultCard'
import { render } from '@testing-library/react-native'
import { LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'
import { configureStore } from '@reduxjs/toolkit'
import { wallet } from '@store/wallet'
import { loans } from '@store/loans'
import { RootState } from '@store'
import { Provider } from 'react-redux'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn()
}))
jest.mock('@shared-contexts/DeFiScanContext')
jest.mock('@gorhom/bottom-sheet', () => ({
  useBottomSheetModal: jest.fn().mockReturnValue({ dismiss: jest.fn() }),
  BottomSheetModal: () => <></>
}))
jest.mock('@components/BottomSheetInfo', () => ({
  BottomSheetInfo: () => <></>
}))
jest.mock('react-native-popover-view')

describe('Vault card', () => {
  const initialState: Partial<RootState> = {
    loans: {
      vaults: [{
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
      }],
      collateralTokens: [],
      loanPaymentTokenActivePrices: {},
      hasFetchedLoansData: false,
      hasFetchedVaultsData: false,
      hasFetchedLoanSchemes: true,
      loanSchemes: [],
      loanTokens: []
    }
  }
  const store = configureStore({
    preloadedState: initialState,
    reducer: {
      wallet: wallet.reducer,
      loans: loans.reducer
    }
  })

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
      },
      testID: 'vault'
    }
    const rendered = render(<Provider store={store}><VaultCard vault={lockedVault.vault} testID={lockedVault.testID} /></Provider>)
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
      },
      testID: 'vault'
    }
    const rendered = render(<Provider store={store}><VaultCard {...atRiskVault} testID={atRiskVault.testID} /></Provider>)
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
      },
      testID: 'vault'
    }
    const rendered = render(<Provider store={store}><VaultCard vault={safeVault.vault} testID={safeVault.testID} /></Provider>)
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
      },
      testID: 'vault'
    }
    const rendered = render(<Provider store={store}><VaultCard vault={newVault.vault} testID={newVault.testID} /></Provider>)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
