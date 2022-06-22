import { fireEvent, render } from '@testing-library/react-native'
import { Text } from 'react-native'
import { ButtonV2, ButtonFillType } from './ButtonV2'

jest.mock('@shared-contexts/ThemeProvider')

const buttonFill: ButtonFillType[] = ['fill', 'outline', 'flat']

describe('button', () => {
  buttonFill.forEach(fill => {
    it(`should match styling of button type ${fill}`, () => {
      const onPress = jest.fn()
      const enabled = render(
        <ButtonV2
          disabled={false}
          fill={fill}
          label='Submit'
          onPress={onPress}
        />).toJSON()
      expect(enabled).toMatchSnapshot()

      const disabled = render(
        <ButtonV2
          disabled
          fill={fill}
          label='Submit'
          onPress={onPress}
        />).toJSON()
      expect(disabled).toMatchSnapshot()
    })
  })

  it('should be clickable', async () => {
    const onPress = jest.fn()
    const component = (
      <ButtonV2
        onPress={onPress}
        testID='primary_button'
      >
        <Text>
          Hello World
        </Text>
      </ButtonV2>
    )
    const rendered = render(component)
    const receiveButton = await rendered.findByTestId('primary_button')
    fireEvent.press(receiveButton)
    expect(rendered.toJSON()).toMatchSnapshot()
    expect(onPress).toBeCalled()
  })

  it('should not be clickable when disabled', async () => {
    const onPress = jest.fn()
    const component = (
      <ButtonV2
        disabled
        onPress={onPress}
        testID='primary_button'
      >
        <Text>
          Hello World
        </Text>
      </ButtonV2>
    )
    const rendered = render(component)
    const receiveButton = await rendered.findByTestId('primary_button')
    fireEvent.press(receiveButton)
    expect(rendered.toJSON()).toMatchSnapshot()
    expect(onPress).toBeCalledTimes(0)
  })
})
