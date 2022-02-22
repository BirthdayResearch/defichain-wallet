import { render } from '@testing-library/react-native'
import { LoanCards } from './LoanCards'
import { LoanToken, LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'
import { Provider } from 'react-redux'
import { RootState } from '@store'
import { configureStore } from '@reduxjs/toolkit'
import { loans } from '@store/loans'
import { wallet } from '@store/wallet'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@contexts/FeatureFlagContext')
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn()
}))

describe('loan cards', () => {
  it('should match snapshot', async () => {
    const TS25 = {
      id: '17',
      symbol: 'TS25',
      symbolKey: 'TS25',
      name: '',
      decimal: 8,
      limit: '0',
      mintable: true,
      tradeable: true,
      isDAT: true,
      isLPS: false,
      isLoanToken: true,
      finalized: false,
      minted: '0',
      creation: {
        tx: '3a7e97db4b913fd249da2a59f2edd84f34e111fe1c775a01addfb3b96c147d40',
        height: 151
      },
      destruction: {
        tx: '0000000000000000000000000000000000000000000000000000000000000000',
        height: -1
      },
      collateralAddress: 'bcrt1qyrfrpadwgw7p5eh3e9h3jmu4kwlz4prx73cqny',
      displaySymbol: 'dTS25'
    }

    const TR50 = {
      id: '18',
      symbol: 'TR50',
      symbolKey: 'TR50',
      name: '',
      decimal: 8,
      limit: '0',
      mintable: true,
      tradeable: true,
      isDAT: true,
      isLPS: false,
      isLoanToken: true,
      finalized: false,
      minted: '0',
      creation: {
        tx: '57135919430b915f6f462142161e94474aae824791fa3644541102d7a7959a63',
        height: 152
      },
      destruction: {
        tx: '0000000000000000000000000000000000000000000000000000000000000000',
        height: -1
      },
      collateralAddress: 'bcrt1qyrfrpadwgw7p5eh3e9h3jmu4kwlz4prx73cqny',
      displaySymbol: 'dTR50'
    }

    const TU10 = {
      id: '15',
      symbol: 'TU10',
      symbolKey: 'TU10',
      name: '',
      decimal: 8,
      limit: '0',
      mintable: true,
      tradeable: true,
      isDAT: true,
      isLPS: false,
      isLoanToken: true,
      finalized: false,
      minted: '0',
      creation: {
        tx: '943c2f38cf418ff116c402f4f6ec400039223e5aa4fb41f2c4a6e69ac53a4c45',
        height: 149
      },
      destruction: {
        tx: '0000000000000000000000000000000000000000000000000000000000000000',
        height: -1
      },
      collateralAddress: 'bcrt1qyrfrpadwgw7p5eh3e9h3jmu4kwlz4prx73cqny',
      displaySymbol: 'dTU10'
    }

    const loanCards: LoanToken[] = [
      {
        tokenId: '3a7e97db4b913fd249da2a59f2edd84f34e111fe1c775a01addfb3b96c147d40',
        token: TS25,
        interest: '2',
        fixedIntervalPriceId: 'TS25/USD'
      },
      {
        tokenId: '57135919430b915f6f462142161e94474aae824791fa3644541102d7a7959a63',
        token: TR50,
        interest: '3',
        fixedIntervalPriceId: 'TR50/USD'
      },
      {
        tokenId: '943c2f38cf418ff116c402f4f6ec400039223e5aa4fb41f2c4a6e69ac53a4c45',
        token: TU10,
        interest: '1',
        fixedIntervalPriceId: 'TU10/USD'
      }
    ]
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
        hasFetchedLoansData: false,
        hasFetchedVaultsData: false,
        loanSchemes: [],
        loanTokens: []
      },
      wallet: {
        utxoBalance: '77',
        tokens: [],
        allTokens: { dTS25: TS25, dTR50: TR50, dTU10: TU10 },
        poolpairs: [],
        hasFetchedPoolpairData: false,
        hasFetchedToken: true
      }
    }
    const store = configureStore({
      preloadedState: initialState,
      reducer: {
        wallet: wallet.reducer,
        loans: loans.reducer
      }
    })
    const rendered = render((<Provider store={store}><LoanCards loans={loanCards} /></Provider>))
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
