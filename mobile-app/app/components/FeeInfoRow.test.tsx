import { render } from '@testing-library/react-native'
import { FeeInfoRow } from './FeeInfoRow'

jest.mock('@shared-contexts/ThemeProvider')

jest.mock('./BottomSheetModal', () => ({
  BottomSheetModal: () => <></>
}))

describe('estimated fee info scanner', () => {
  it('should match snapshot of estimated fee', async () => {
    const component = (
      <FeeInfoRow
        type='ESTIMATED_FEE'
        value='100'
        testID='text_fee'
        suffix='DFI'
      />
    )
    const rendered = render(component)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should match snapshot of vault fee', async () => {
    const component = (
      <FeeInfoRow
        type='VAULT_FEE'
        value='100'
        testID='text_fee'
        suffix='DFI'
      />
    )
    const rendered = render(component)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
