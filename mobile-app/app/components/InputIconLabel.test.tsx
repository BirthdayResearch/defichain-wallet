import { render } from '@testing-library/react-native'
import { IconLabelScreenType, InputIconLabel } from './InputIconLabel'

jest.mock('@shared-contexts/ThemeProvider')
const screenType = [IconLabelScreenType.Balance, IconLabelScreenType.DEX]

describe('input icon label', () => {
  screenType.forEach(type => {
    it(`should match the output in ${type} screen`, () => {
      const tokenSymbol = 'DFI'
      const component = (
        <InputIconLabel
          label={tokenSymbol}
          screenType={type}
        />
      )
      const rendered = render(component)
      expect(rendered.toJSON()).toMatchSnapshot()
    })
  })
})
