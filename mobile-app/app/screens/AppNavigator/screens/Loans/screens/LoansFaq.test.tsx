import { render } from '@testing-library/react-native'

import { LoansFaq } from './LoansFaq'

jest.mock('@shared-contexts/ThemeProvider')

describe('LoansFaq FAQ screen', () => {
  it('should match snapshot', async () => {
    const rendered = render(<LoansFaq />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
