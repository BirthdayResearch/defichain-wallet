import { StackScreenProps } from '@react-navigation/stack'
import React, { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { Text } from '../../../../components'
import { tailwind } from '../../../../tailwind'
import { MasternodeParamList } from './MasternodesNavigator'

type Props = StackScreenProps<MasternodeParamList, 'MasternodeDetailScreen'>

export function MasternodeDetailScreen ({ route, navigation }: Props): JSX.Element {
  const [masternode] = useState(route.params.masternode)

  return (
    <ScrollView style={tailwind('bg-gray-100')}>
      <View style={tailwind('bg-white mx-8 mt-32 p-8')}>
        {renderField('Owner', masternode.ownerAuthAddress)}
        {renderField('Operator', masternode.operatorAuthAddress)}
        {renderField('Creation', masternode.creationHeight)}
        {renderField('Resign', masternode.resignHeight)}
        {renderField('State', masternode.state)}
        {renderField('Minted', masternode.mintedBlocks)}
      </View>
    </ScrollView>
  )
}

function renderField (key: string, value: any): JSX.Element {
  return (
    <View style={tailwind('flex-row items-start')}>
      <View style={tailwind('w-20 text-right pr-2')}>
        <Text style={tailwind('text-sm mb-1 font-semibold')}>{key}: </Text>
      </View>
      <View style={tailwind('flex flex-1')}>
        <Text style={tailwind('text-sm mb-1 break-all')}>{value}</Text>
      </View>
    </View>
  )
}
