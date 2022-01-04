import * as React from 'react'
import { render } from '@testing-library/react-native'
import { ThemeProvider, useTheme, useThemeContext } from './ThemeProvider'
import { Text, useColorScheme, View } from 'react-native'

jest.mock('@shared-contexts/NetworkContext')

describe('useTheme hook test', () => {
  it('should match snapshot', () => {
    function ThemeProviderComponent (): JSX.Element {
      const api = {
        set: jest.fn(),
        get: async () => 'light'
      }
      const colorScheme = useColorScheme()
      const { theme, isThemeLoaded } = useTheme({ api, colorScheme })
      return (
        <View>
          <Text>{theme}</Text>
          <Text>{isThemeLoaded.toString()}</Text>
        </View>
      )
    }

    const rendered = render(<ThemeProviderComponent />)

    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should match snapshot when theme is not set', () => {
    function ThemeProviderComponent (): JSX.Element {
      const api = {
        set: jest.fn(),
        get: async () => null
      }
      const colorScheme = 'light'
      const { theme, isThemeLoaded } = useTheme({ api, colorScheme })
      return (
        <View>
          <Text>{theme}</Text>
          <Text>{isThemeLoaded.toString()}</Text>
        </View>
      )
    }

    const rendered = render(<ThemeProviderComponent />)

    expect(rendered.toJSON()).toMatchSnapshot()
  })
})

describe('ThemeProvider Context test', () => {
  it('should match snapshot', () => {
    function ThemeProviderComponent (): JSX.Element {
      const { isLight, theme } = useThemeContext()
      return (
        <View>
          <Text>{isLight.toString()}</Text>
          <Text>{theme}</Text>
        </View>
      )
    }
    const api = {
      set: jest.fn(),
      get: async () => 'light'
    }
    const rendered = render(
      <ThemeProvider api={api} colorScheme={jest.fn()}>
        <ThemeProviderComponent />
      </ThemeProvider>
    )
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
