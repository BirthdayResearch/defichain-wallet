import { render } from '@testing-library/react-native'
import React from 'react'
import { WalletTextInput, InputType } from './WalletTextInput'

jest.mock('../contexts/ThemeProvider')
const WalletInputType: InputType[] = ['default', 'numeric']

describe('wallet text input', () => {
  WalletInputType.forEach(type => {
    it(`should render with ${type} keyboard`, async () => {
      const value = ''
      const onClear = jest.fn
      const rendered = render(
        <WalletTextInput
          title='foo'
          titleTestID='titleTestID'
          placeholder='bar'
          testID='testID'
          value={value}
          valid={false}
          inlineValidationText='invalid'
          inputType={type}
          displayClearButton={value !== ''}
          onClearButtonPress={onClear}
        />
      )
      expect(rendered.toJSON()).toMatchSnapshot()
    })
  })
})
