import { render } from '@testing-library/react-native'
import { PasscodePrompt } from './PasscodePrompt'
import { TransactionStatus } from '@screens/TransactionAuthorization/api/transaction_types'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'web',
  select: () => jest.fn
}))

const StatusTypes: TransactionStatus[] = [TransactionStatus.INIT, TransactionStatus.IDLE, TransactionStatus.BLOCK, TransactionStatus.PIN, TransactionStatus.SIGNING, TransactionStatus.AUTHORIZED]

describe('transaction authorization screen', () => {
  StatusTypes.forEach(type => {
    it(`should match snapshot of status: ${type}`, async () => {
      const mockTransaction = {
        sign: jest.fn()
      }
      const onCancel = jest.fn
      const onPinInput = jest.fn
      const closeModal = jest.fn
      const modalRef = { current: null }
      const rendered = render(
        <PasscodePrompt
          onCancel={onCancel}
          title='title'
          message='foo'
          transaction={mockTransaction}
          status={type}
          pinLength={6}
          onPinInput={onPinInput}
          pin='foo'
          loadingMessage='foo'
          authorizedTransactionMessage={{
            title: 'foo',
            description: 'bar'
          }}
          grantedAccessMessage={{
            title: 'foo',
            description: 'bar'
          }}
          isRetry
          attemptsRemaining={3}
          maxPasscodeAttempt={3}
          modalRef={modalRef}
          promptModalName='foo'
          onModalCancel={closeModal}
        />
      )
      expect(rendered.toJSON()).toMatchSnapshot()
    })
  })
})
