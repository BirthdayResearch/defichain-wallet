import { render } from '@testing-library/react-native'
import React from 'react'
import { LoanCards } from './LoanCards'
import { LoanToken } from '@defichain/whale-api-client/dist/api/loan'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@contexts/FeatureFlagContext')
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn()
}))

describe('loan cards', () => {
  it('should match snapshot', async () => {
    const loanCards: LoanToken[] = [
      {
        tokenId: '3a7e97db4b913fd249da2a59f2edd84f34e111fe1c775a01addfb3b96c147d40',
        token: {
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
        },
        interest: '2',
        fixedIntervalPriceId: 'TS25/USD'
      },
      {
        tokenId: '57135919430b915f6f462142161e94474aae824791fa3644541102d7a7959a63',
        token: {
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
        },
        interest: '3',
        fixedIntervalPriceId: 'TR50/USD'
      },
      {
        tokenId: '943c2f38cf418ff116c402f4f6ec400039223e5aa4fb41f2c4a6e69ac53a4c45',
        token: {
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
        },
        interest: '1',
        fixedIntervalPriceId: 'TU10/USD'
      }
    ]

    const rendered = render(<LoanCards loans={loanCards} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
