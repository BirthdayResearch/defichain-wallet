import { render } from '@testing-library/react-native'
import BigNumber from 'bignumber.js'
import { AmountButtonTypes, SetAmountButton } from './SetAmountButton'

jest.mock('@shared-contexts/ThemeProvider')
const buttonType: AmountButtonTypes[] = [AmountButtonTypes.half, AmountButtonTypes.max]
const buttonAmount = new BigNumber(10)

describe('set amount button', () => {
  buttonType.forEach(type => {
    it(`should match styling of set amount button type ${type}`, () => {
      const onPress = jest.fn()
      const component = (
        <SetAmountButton
          amount={buttonAmount}
          onPress={onPress}
          type={type}
        />
      )
      const rendered = render(component)
      expect(rendered.toJSON()).toMatchSnapshot()
    })
  })
})
