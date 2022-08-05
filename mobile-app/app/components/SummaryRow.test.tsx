import { render } from '@testing-library/react-native'
import { SummaryRow } from '@components/SummaryRow'

jest.mock('@shared-contexts/ThemeProvider')

describe('Summary Row', () => {
  it('should match snapshot', async () => {
    const rendered = render(
      <SummaryRow
        title='title'
        value='value'
        testID='testId'
        subValue='subValue'
        valueTextStyle='font-semibold-v2'
      />
    )
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
