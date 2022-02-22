import { configureStore } from '@reduxjs/toolkit'
import { RootState } from '@store'
import { wallet } from '@store/wallet'
import { render, RenderAPI } from '@testing-library/react-native'
import { AppIcon } from '../AppIcon'
import { getNativeIcon } from './index'
import { Provider } from 'react-redux'

jest.mock('randomcolor', () => jest.fn().mockReturnValue('#ffffff'))

const icons = ['_UTXO', 'DFI', 'DFI (UTXO)', 'DFI (Token)', 'BTC', 'dBCH', 'dBTC', 'dDFI', 'dDOGE', 'dETH', 'dLTC',
  'dUSDT', 'dUSDC', 'FAKE', 'dDUSD', 'DUSD', 'dTSLA', 'dGOOGL', 'dAAPL', 'dAMD', 'dGME', 'dBABA', 'dPLTR',
  'dARKK', 'dAMZN', 'dCOIN', 'dFB', 'dTWTR', 'dNVDA', 'dMSFT',
  'dETH-DFI', 'dBTC-DFI', 'dUSDT-DFI', 'dDOGE-DFI', 'dLTC-DFI', 'dBCH-DFI', 'dUSDC-DFI', 'DUSD-DFI', 'dTSLA-DUSD', 'dURTH-DUSD', 'dTLT-DUSD', 'dSLV-DUSD',
  'dGME-DUSD', 'dGOOGL-DUSD', 'dBABA-DUSD', 'dPLTR-DUSD', 'dAAPL-DUSD', 'dSPY-DUSD', 'dQQQ-DUSD', 'dPDBC-DUSD', 'dVNQ-DUSD', 'dARKK-DUSD', 'dGLD-DUSD'
]

describe('token icons', () => {
  icons.forEach(icon => {
    it(`getNativeIcon("${icon}") should get <Icon${icon} /> snapshot`, () => {
      const initialState: Partial<RootState> = {
        wallet: {
          utxoBalance: '77',
          tokens: [],
          allTokens: {
            dTSLA: {
              id: '17',
              symbol: 'TSLA',
              symbolKey: 'TSLA',
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
              displaySymbol: 'dTSLA'
            }
          },
          poolpairs: [],
          hasFetchedPoolpairData: false,
          hasFetchedToken: true
        }
      }

      function renderWithProvider (renderedComponent: JSX.Element): RenderAPI {
        const store = configureStore({
          preloadedState: initialState,
          reducer: { wallet: wallet.reducer }
        })

        return render(<Provider store={store}>{renderedComponent}</Provider>)
      }

      const IconComponent = (): JSX.Element => {
        const Icon = getNativeIcon(icon)
        return <Icon />
      }
      const tree = renderWithProvider(<IconComponent />).toJSON()
      expect(tree).toMatchSnapshot()
    })
  })

  it('<AppIcon /> should match snapshot', () => {
    const tree = render(<AppIcon />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
