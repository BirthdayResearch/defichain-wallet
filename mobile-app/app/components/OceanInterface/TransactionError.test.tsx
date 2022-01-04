import { render } from '@testing-library/react-native'
import { TransactionError, ErrorCodes, ErrorMapping } from './TransactionError'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('@shared-contexts/NativeLoggingProvider')

describe('info text', () => {
  const errors: ErrorMapping[] = [
    {
      code: ErrorCodes.UnknownError,
      message: 'UnknownError'
    },
    {
      code: ErrorCodes.InsufficientUTXO,
      message: 'not enough balance after combing all prevouts'
    },
    {
      code: ErrorCodes.InsufficientUTXO,
      message: 'no prevouts available to create a transaction'
    },
    {
      code: ErrorCodes.InsufficientBalance,
      message: 'amount is less than'
    },
    {
      code: ErrorCodes.PoolSwapHigher,
      message: 'Price is higher than indicated.'
    },
    {
      code: ErrorCodes.InsufficientDFIInVault,
      message: 'At least 50% of the vault must be in DFI when taking a loan'
    },
    {
      code: ErrorCodes.LackOfLiquidity,
      message: 'Lack of liquidity'
    },
    {
      code: ErrorCodes.PaybackLoanInvalidPrice,
      message: 'Cannot payback loan while any of the asset\'s price is invalid'
    },
    {
      code: ErrorCodes.NoLiveFixedPrices,
      message: 'No live fixed prices'
    },
    {
      code: ErrorCodes.VaultNotEnoughCollateralization,
      message: 'Vault does not have enough collateralization ratio defined by loan scheme'
    },
    {
      code: 404,
      message: 'Error: Not found, code: 404, message: Page not found'
    }
  ]

  errors.forEach(error => {
    it(`should match snapshot for error ${error.message}`, async () => {
      const rendered = render(
        <TransactionError
          errMsg={error.message}
          onClose={jest.fn()}
        />)
      expect(rendered.toJSON()).toMatchSnapshot()
    })
  })
})
