import * as React from 'react'
import { TouchableOpacity, View, Text } from 'react-native'
import { tailwind } from '../tailwind'

export function RadioButton ({ testID, isChecked, text, onChange }: { testID: string, isChecked: boolean, text: string, onChange: (v: any) => void }): JSX.Element {
  const renderCheckedView = (): (JSX.Element | null) => {
    return isChecked ? (
      <View testID={`${testID}_checked`} style={tailwind('flex w-4 h-4 justify-center pl-4 border-primary bg-primary rounded-full')} />
    ) : null
  }

  return (
    <TouchableOpacity
      testID={testID}
      style={tailwind('flex-row items-center justify-center h-16 pl-4 pr-4 mt-2 ml-2 mr-2')}
      onPress={onChange}
    >
      <View style={tailwind('h-8 w-8 rounded-full mr-2 items-center justify-center border-2 border-primary')}>
        {renderCheckedView()}
      </View>
      <View style={tailwind('flex h-12 justify-center pl-2')}>
        <Text style={tailwind('text-xs')}>{text}</Text>
      </View>
    </TouchableOpacity>
  )
}
