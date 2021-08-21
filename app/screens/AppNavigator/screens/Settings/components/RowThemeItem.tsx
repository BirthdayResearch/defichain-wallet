import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as React from 'react'
import { ThemePersistence } from '../../../../../api/wallet/theme_storage'
import { Switch, Text, View } from '../../../../../components'
import { useTheme } from '../../../../../hooks/useTheme'
import { tailwind } from '../../../../../tailwind'
import { translate } from '../../../../../translations'

export function RowThemeItem (): JSX.Element {
  const { theme, setTheme } = useTheme()
  return (
    <View
      testID='theme_row'
      style={tailwind('flex flex-row p-4 pr-2 bg-white items-center justify-between border-b border-gray-200', { 'bg-black': theme === 'dark' })}
    >
      <Text style={tailwind('font-medium')}>
        {translate('screens/Settings', 'Theme')}
      </Text>
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
    </View>
  )
}
