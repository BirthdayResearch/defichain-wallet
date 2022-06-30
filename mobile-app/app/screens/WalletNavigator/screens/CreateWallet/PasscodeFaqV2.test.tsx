import { render } from '@testing-library/react-native'

import { PasscodeFaqV2 } from './PasscodeFaqV2'

jest.mock('@shared-contexts/ThemeProvider')
describe('Passcode FAQ screen', () => {
  it('should match snapshot', async () => {
    const rendered = render(<PasscodeFaqV2 />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
