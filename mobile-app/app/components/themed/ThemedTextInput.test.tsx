import { render } from '@testing-library/react-native'
import * as Localization from 'expo-localization'
import { Platform } from 'react-native'
import { ThemedTextInput } from './ThemedTextInput'

jest.mock('@shared-contexts/ThemeProvider')
jest.mock('expo-localization')

const platform = ['ios', 'android']

describe('text input', () => {
  platform.forEach((os) => {
    it(`should match snapshot with OS ${os} period decimal locale`, () => {
      (Platform as any).OS = os;
      (Localization as any).decimalSeparator = '.'
      const component = (
        <ThemedTextInput
          editable
          placeholder='Enter an amount'
          value='123'
        />
      )
      const rendered = render(component)
      expect(rendered.toJSON()).toMatchSnapshot()
    })

    it(`should match snapshot with OS ${os} period comma locale`, () => {
      (Platform as any).OS = os;
      (Localization as any).decimalSeparator = ','
      const component = (
        <ThemedTextInput
          editable
          placeholder='Enter an amount'
          value='123'
        />
      )
      const rendered = render(component)
      expect(rendered.toJSON()).toMatchSnapshot()
    })

    it(`should match snapshot with OS ${os} period unknown locale`, () => {
      (Platform as any).OS = os;
      (Localization as any).decimalSeparator = ' '
      const component = (
        <ThemedTextInput
          editable
          placeholder='Enter an amount'
          value='123'
        />
      )
      const rendered = render(component)
      expect(rendered.toJSON()).toMatchSnapshot()
    })
  })
})
