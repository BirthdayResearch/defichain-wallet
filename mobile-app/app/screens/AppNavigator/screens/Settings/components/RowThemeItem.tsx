import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useState } from 'react'
import { ThemePersistence } from '@api'
import { Switch, View } from '@components/index'
import { ThemedText, ThemedView } from '@components/themed'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import { translate } from '@translations'

export function RowThemeItem (): JSX.Element {
  const {
    setTheme,
    isLight
  } = useThemeContext()
  const [isDark, setIsDark] = useState<boolean>(!isLight)
  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-200')}
      style={tailwind('flex flex-row p-4 pr-2 items-center justify-between')}
      testID='theme_row'
    >
      <ThemedText
        dark={tailwind('text-white text-opacity-90')}
        light={tailwind('text-black')}
        style={tailwind('font-medium')}
      >
        {translate('screens/Settings', 'Theme')}
      </ThemedText>

      <View style={tailwind('flex-row items-center')}>
        <MaterialCommunityIcons
          name='white-balance-sunny'
          size={20}
          testID='light_mode_icon'
          style={tailwind('mr-2 text-gray-300', { 'text-yellow-400': isLight })}
        />

        <Switch
          onValueChange={async (v) => {
            const newTheme = v ? 'dark' : 'light'
            setTheme(newTheme)
            setIsDark(newTheme === 'dark')
            await ThemePersistence.set(newTheme)
          }}
          testID='theme_switch'
          value={isDark}
        />

        <MaterialCommunityIcons
          name='moon-waning-crescent'
          size={20}
          testID='dark_mode_icon'
          style={tailwind('ml-2 text-gray-300', { 'text-yellow-400': !isLight })}
        />
      </View>
    </ThemedView>
  )
}
