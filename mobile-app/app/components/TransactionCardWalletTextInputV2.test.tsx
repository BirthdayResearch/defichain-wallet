import { render } from '@testing-library/react-native'
import { InputType, TransactionCardWalletTextInputV2 } from './TransactionCardWalletTextInputV2'

jest.mock('@shared-contexts/ThemeProvider')
const WalletInputType: InputType[] = ['default', 'numeric']

describe('wallet transactional card text input', () => {
  WalletInputType.forEach(type => {
    it(`should render with ${type} keyboard`, async () => {
      const value = ''
      const onClear = jest.fn
      const rendered = render(
        <TransactionCardWalletTextInputV2
          title='foo'
          titleTestID='titleTestID'
          placeholder='bar'
          testID='testID'
          value={value}
          valid={false}
          inlineText={{
            type: 'error',
            text: 'invalid'
          }}
          inputType={type}
          displayClearButton={value !== ''}
          onClearButtonPress={onClear}
        />
      )
      expect(rendered.toJSON()).toMatchSnapshot()
    })
  })
})
