import { ThemedIcon } from '@components/themed'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { tailwind } from '@tailwind'
import { TouchableOpacity } from 'react-native'
import { SettingsParamList } from '../../Settings/SettingsNavigator'

export function HeaderSettingButton (): JSX.Element {
  const navigation = useNavigation<NavigationProp<SettingsParamList>>()
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Settings')}
      testID='header_settings'
    >
      <ThemedIcon
        iconType='MaterialIcons'
        name='settings'
        size={28}
        style={tailwind('ml-2')}
        light={tailwind('text-primary-500')}
        dark={tailwind('text-darkprimary-500')}
      />
    </TouchableOpacity>
  )
}
