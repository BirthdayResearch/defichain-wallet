import { render } from '@testing-library/react-native'
import { ThemeProvider, useTheme, useThemeContext } from './ThemeProvider'
import { Text, View } from 'react-native'
import { renderHook } from '@testing-library/react-hooks'

jest.mock('@shared-contexts/NetworkContext')

describe('useTheme hook test', () => {
  it('should pass when theme is not set', async () => {
    const desiredTheme = 'dark'
    const api = {
      set: jest.fn(),
      get: async () => null
    }
    const { result, waitForNextUpdate } = renderHook(() => useTheme({ api, colorScheme: desiredTheme }))
    await waitForNextUpdate()
    expect(result.current.theme).toBe(desiredTheme)
    expect(result.current.isThemeLoaded).toBe(true)
  })

  it('should pass when theme is already set', async () => {
    const desiredTheme = 'dark'
    const api = {
      set: jest.fn(),
      get: async () => desiredTheme
    }
    const { result, waitForNextUpdate } = renderHook(() => useTheme({ api, colorScheme: 'light' }))
    await waitForNextUpdate()
    expect(result.current.theme).toBe(desiredTheme)
    expect(result.current.isThemeLoaded).toBe(true)
  })

  it('should pass when theme is not set and colorScheme is not defined', async () => {
    const api = {
      set: jest.fn(),
      get: async () => null
    }
    const { result, waitForNextUpdate } = renderHook(() => useTheme({ api }))
    await waitForNextUpdate()
    expect(result.current.theme).toBe('light')
    expect(result.current.isThemeLoaded).toBe(true)
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
