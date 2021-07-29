import { StackScreenProps } from '@react-navigation/stack'
import * as React from 'react'
import { ScrollView } from 'react-native'
import { Text, View } from '../../../../../components'
import { tailwind } from '../../../../../tailwind'
import { translate } from '../../../../../translations'
import { SettingsParamList } from '../SettingsNavigator'

type Props = StackScreenProps<SettingsParamList, 'RecoveryWordsScreen'>

export function RecoveryWordsScreen ({ route }: Props): JSX.Element {
  const { words } = route.params
  return (
    <ScrollView>
      <Text style={tailwind('text-black opacity-60 pt-6 pb-2 px-4 text-sm')}>
        {translate('screens/RecoveryWordsScreen', 'Keep your recovery words safe and private')}
      </Text>
      <View style={tailwind('pb-12')}>
        {words.map((word, index) => {
          return <MnemonicWordRow word={word} index={index} key={index} />
        })}
      </View>
    </ScrollView>
  )
}

function MnemonicWordRow (props: {word: string, index: number}): JSX.Element {
  return (
    <View style={tailwind('flex-row px-4 py-3 bg-white border-b border-gray-100')}>
      <Text style={tailwind('w-10')}>
        {props.index + 1}.
      </Text>
      <Text>
        {props.word}
      </Text>
    </View>
  )
}
