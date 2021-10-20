import { render } from '@testing-library/react-native'
import React from 'react'
import { ConversionDetailsRow } from './ConversionDetailsRow'

jest.mock('../contexts/ThemeProvider')

describe('Conversion Details Row', () => {
  it('should match snapshot', async () => {
    const rendered = render(<ConversionDetailsRow utxoBalance='10.00000000' tokenBalance='0.00000001' />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
