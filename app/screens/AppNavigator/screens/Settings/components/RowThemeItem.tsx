import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as React from 'react'
import { ThemePersistence } from '../../../../../api/wallet/theme_storage'
import { Switch, View } from '../../../../../components'
import { ThemedText, ThemedView } from '../../../../../components/themed'
import { useThemeContext } from '../../../../../contexts/ThemeProvider'
import { tailwind } from '../../../../../tailwind'
import { translate } from '../../../../../translations'

export function RowThemeItem (): JSX.Element {
  const { theme, setTheme } = useThemeContext()
  return (
    <ThemedView
      testID='theme_row'
      style={tailwind('flex flex-row p-4 pr-2 items-center justify-between')}
      light='bg-white border-b border-gray-200'
      dark='bg-darksurface border-b border-dark'
    >
      <ThemedText style={tailwind('font-medium')} light='text-black' dark='text-white text-opacity-90'>
        {translate('screens/Settings', 'Theme')}
      </ThemedText>
      <View style={tailwind('flex-row items-center')}>
        <MaterialCommunityIcons
          style={tailwind('mr-2 text-gray-300', { 'text-yellow-400': theme !== 'dark' })}
          name='white-balance-sunny'
          size={20}
        />
        <Switch
          onValueChange={async (v) => {
            const newTheme = v ? 'dark' : 'light'
            await ThemePersistence.set(newTheme)
            setTheme(newTheme)
          }}
          value={theme === 'dark'}
          testID='theme_switch'
        />
        <MaterialCommunityIcons
          style={tailwind('ml-2 text-gray-300', { 'text-yellow-400': theme === 'dark' })}
          name='moon-waning-crescent'
          size={20}
        />
      </View>
    </ThemedView>
  )
}
