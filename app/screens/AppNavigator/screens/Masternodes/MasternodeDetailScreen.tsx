import { StackScreenProps } from '@react-navigation/stack'
import * as React from 'react'
import { useState } from 'react'
import { ScrollView, Switch, View } from 'react-native'
import { Text } from '../../../../components'
import { tailwind } from '../../../../tailwind'
import { MasternodeParamList } from './MasternodesNavigator'
import { SectionTitle } from '../../../../components/SectionTitle'
import { translate } from '../../../../translations'

type Props = StackScreenProps<MasternodeParamList, 'MasternodeDetailScreen'>

export function MasternodeDetailScreen ({ route }: Props): JSX.Element {
  const [masternode] = useState(route.params.masternode)

  const [isEnabled, setIsEnabled] = useState(false)
  const toggleSwitch = (): void => setIsEnabled(previousState => !previousState)

  return (
    <ScrollView style={tailwind('bg-gray-100')}>
      <View style={tailwind('flex-row flex-auto items-center justify-between')}>
        <SectionTitle
          testID='masternode_details_title'
          text={translate('screens/MasternodeDetailScreen', 'MASTERNODE DETAILS')}
        />
        <Switch
          trackColor={{ false: 'rgba(120, 120, 128, 0.20)', true: '#34C759' }}
          thumbColor='#fff'
          ios_backgroundColor='#ffffff'
          onValueChange={toggleSwitch}
          value={isEnabled}
          testID='masternode_state_switch'
          style={tailwind('mr-5')}
        />
      </View>
      <View
        style={tailwind('bg-white pt-4 pb-4 flex-row justify-between items-center')}
        testID='masternodes_details'
      >
        <View style={tailwind('w-full')}>
          {renderField('Owner', masternode.ownerAuthAddress)}
          {renderField('Operator', masternode.operatorAuthAddress === masternode.ownerAuthAddress ? 'Same as owner' : masternode.operatorAuthAddress)}
          {renderField('State', masternode.state)}
          {renderField('Minted', masternode.mintedBlocks)}
          {renderField('Creation', masternode.creationHeight)}
          {renderField('Resign', masternode.resignHeight)}
          {renderField('ResignTx', masternode.resignTx)}
          {renderField('BanTx', masternode.banTx)}
        </View>
      </View>
    </ScrollView>
  )
}

function renderField (key: string, value: any): JSX.Element {
  return (
    <View style={tailwind('flex-row items-start pt-2 pb-2')} testID={`masternodes_details_${key}`}>
      <View style={tailwind('w-3/12 text-right pr-3')}>
        <Text style={tailwind('text-sm mb-1 font-semibold')}>{key}: </Text>
      </View>
      <View style={tailwind('w-9/12 pr-3')}>
        <Text style={tailwind('text-sm mb-1 break-words')}>{value}</Text>
      </View>
    </View>
  )
}
