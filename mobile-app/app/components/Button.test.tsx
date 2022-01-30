import { fireEvent, render } from '@testing-library/react-native'
import { Text } from 'react-native'
import { Button, ButtonColorType, ButtonFillType } from './Button'

jest.mock('@shared-contexts/ThemeProvider')

const buttonFill: ButtonFillType[] = ['fill', 'outline', 'flat']
const buttonColor: ButtonColorType[] = ['primary', 'secondary']

describe('button', () => {
  buttonFill.forEach(fill => {
    buttonColor.forEach(color => {
      it(`should match styling of button type ${fill}-${color}`, () => {
        const onPress = jest.fn()
        const enabled = render(
          <Button
            color={color}
            disabled={false}
            fill={fill}
            label='Submit'
            onPress={onPress}
            title='Test'
          />).toJSON()
        expect(enabled).toMatchSnapshot()

        const disabled = render(
          <Button
            color={color}
            disabled
            fill={fill}
            label='Submit'
            onPress={onPress}
            title='Test'
          />).toJSON()
        expect(disabled).toMatchSnapshot()

        const submitting = render(
          <Button
            color={color}
            disabled
            isSubmitting
            submittingLabel='Submitting'
            fill={fill}
            label='Submit'
            onPress={onPress}
            title='Test'
          />).toJSON()
        expect(submitting).toMatchSnapshot()
      })
    })
  })

  it('should be clickable', async () => {
    const onPress = jest.fn()
    const component = (
      <Button
        onPress={onPress}
        testID='primary_button'
        title='Submit'
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
        title='Submit'
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
