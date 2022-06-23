import { fireEvent, render } from '@testing-library/react-native'
import { Text } from 'react-native'
import { Button, ButtonFillType } from './Button'

jest.mock('@shared-contexts/ThemeProvider')

const buttonFill: ButtonFillType[] = ['fill', 'outline', 'flat']

describe('button', () => {
  buttonFill.forEach(fill => {
    it(`should match styling of button type ${fill}`, () => {
      const onPress = jest.fn()
      const enabled = render(
        <Button
          disabled={false}
          fill={fill}
          label='Submit'
          onPress={onPress}
        />).toJSON()
      expect(enabled).toMatchSnapshot()

      const disabled = render(
        <Button
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
      <Button
        onPress={onPress}
        testID='primary_button'
      >
        <Text>
          Hello World
        </Text>
      </Button>
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
      <Button
        disabled
        onPress={onPress}
        testID='primary_button'
      >
        <Text>
          Hello World
        </Text>
      </Button>
    )
    const rendered = render(component)
    const receiveButton = await rendered.findByTestId('primary_button')
    fireEvent.press(receiveButton)
    expect(rendered.toJSON()).toMatchSnapshot()
    expect(onPress).toBeCalledTimes(0)
  })
})
