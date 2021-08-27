import { fireEvent, render } from '@testing-library/react-native'
import * as React from 'react'
import { Text } from 'react-native'
import { Button } from './Button'

jest.mock('../contexts/ThemeProvider')
const buttonFill = ['fill', 'outline', 'flat']
const buttonColor = ['primary', 'secondary']

describe('button', () => {
  buttonFill.forEach(fill => {
    buttonColor.forEach(color => {
      it(`should match styling of button type ${fill}-${color}`, () => {
        const onPress = jest.fn()
        const enabled = render(<Button
          fill={fill} color={color} disabled={false} title='Test'
          label='Submit' onPress={onPress}
                               />).toJSON()
        expect(enabled).toMatchSnapshot()

        const disabled = render(<Button
          fill={fill} color={color} disabled title='Test'
          label='Submit' onPress={onPress}
                                />).toJSON()
        expect(disabled).toMatchSnapshot()
      })
    })
  })

  it('should be clickable', async () => {
    const onPress = jest.fn()
    const component = (
      <Button onPress={onPress} title='Submit' testID='primary_button'>
        <Text>Hello World</Text>
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
        disabled onPress={onPress} title='Submit'
        testID='primary_button'
      >
        <Text>Hello World</Text>
      </Button>
    )
    const rendered = render(component)
    const receiveButton = await rendered.findByTestId('primary_button')
    fireEvent.press(receiveButton)
    expect(rendered.toJSON()).toMatchSnapshot()
    expect(onPress).toBeCalledTimes(0)
  })
})
