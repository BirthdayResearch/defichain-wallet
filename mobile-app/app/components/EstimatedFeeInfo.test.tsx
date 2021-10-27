import { render } from '@testing-library/react-native'
import * as React from 'react'
import { EstimatedFeeInfo } from './EstimatedFeeInfo'

jest.mock('@shared-contexts/ThemeProvider')

jest.mock('./BottomSheetModal', () => ({
  BottomSheetModal: () => <></>
}))

describe('estimated fee info scanner', () => {
  it('should match snapshot', async () => {
    const component = (
      <EstimatedFeeInfo
        lhs='Estimated fee'
        rhs={{
          value: '100',
          testID: 'text_fee',
          suffix: 'DFI (UTXO)'
        }}
      />
    )
    const rendered = render(component)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
