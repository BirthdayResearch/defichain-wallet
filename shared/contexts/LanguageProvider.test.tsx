import { LanguageProvider, useLanguage, useLanguageContext } from './LanguageProvider'
import { renderHook } from '@testing-library/react-hooks'
import { Text, View } from 'react-native'
import { render } from '@testing-library/react-native'

jest.mock('@shared-contexts/NetworkContext')

describe('useLanguage hook test', () => {
  it('should pass when it uses users devices locale on first app install', async () => {
    const api = {
      set: jest.fn(),
      get: async () => null
    }
    const desiredLanguage = 'fr'
    const { result, waitForNextUpdate } = renderHook(() => useLanguage({ api, locale: desiredLanguage }))
    await waitForNextUpdate()
    expect(result.current.language).toBe(desiredLanguage)
    expect(result.current.isLanguageLoaded).toBe(true)
  })

  it('should pass when use already selected language', async () => {
    const desiredLanguage = 'fr'
    const api = {
      set: jest.fn(),
      get: async () => desiredLanguage
    }
    const { result, waitForNextUpdate } = renderHook(() => useLanguage({ api, locale: 'en' }))
    await waitForNextUpdate()
    expect(result.current.language).toBe(desiredLanguage)
    expect(result.current.isLanguageLoaded).toBe(true)
  })

  it('should pass when no language is selected or dont find any language on users device', async () => {
    const api = {
      set: jest.fn(),
      get: async () => null
    }
    const { result, waitForNextUpdate } = renderHook(() => useLanguage({ api }))
    await waitForNextUpdate()
    expect(result.current.language).toBe('en')
    expect(result.current.isLanguageLoaded).toBe(true)
  })
})

describe('LanguageProvider Context test', () => {
  it('should match snapshot', async () => {
    function ThemeProviderComponent (): JSX.Element {
      const { language } = useLanguageContext()
      return (
        <View>
          <Text>{language}</Text>
        </View>
      )
    }
    const api = {
      set: jest.fn(),
      get: async () => 'fr'
    }
    const rendered = render(
      <LanguageProvider api={api} colorScheme={jest.fn()}>
        <ThemeProviderComponent />
      </LanguageProvider>
    )
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
