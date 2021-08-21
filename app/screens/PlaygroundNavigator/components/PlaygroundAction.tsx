import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Text } from '../../../components'
import { useThemeContext } from '../../../contexts/ThemeProvider'
import { tailwind } from '../../../tailwind'

interface PlaygroundActionProps {
  testID: string
  title: string
  onPress: () => void
}

export function PlaygroundAction (props: PlaygroundActionProps): JSX.Element {
  const { getThemeClass } = useThemeContext()
  return (
    <TouchableOpacity onPress={props.onPress} testID={props.testID}>
      <View
        style={tailwind('flex-row items-center justify-between p-4 bg-white border-b border-gray-100', getThemeClass('row-bg'))}
      >
        <Text style={tailwind('flex-1 font-medium', getThemeClass('body-text'))}>
          {props.title}
        </Text>
        <View style={tailwind('px-4')} />
        <Ionicons name='chevron-forward' style={tailwind('opacity-70', getThemeClass('body-text'))} size={18} />
      </View>
    </TouchableOpacity>
  )
}
