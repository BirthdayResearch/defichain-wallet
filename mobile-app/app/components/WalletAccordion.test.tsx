import { render } from '@testing-library/react-native'
import React from 'react'
import { WalletAccordion } from './WalletAccordion'

jest.mock('@shared-contexts/ThemeProvider')

describe('wallet accordion', () => {
  it('should render', async () => {
    const rendered = render(
      <WalletAccordion
        content={[
          {
            title: 'foo',
            content: 'bar'
          }
        ]}
        title='foo'
      />
    )
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
