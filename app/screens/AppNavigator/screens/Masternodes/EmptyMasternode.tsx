import * as React from 'react'
import { ScrollView, RefreshControl } from 'react-native'
import { NavigationProp } from '@react-navigation/native'
import { MaterialIcons } from '@expo/vector-icons'
import { MasternodeParamList } from './MasternodesNavigator'
import { tailwind } from '../../../../tailwind'
import { Text } from '../../../../components'
import { translate } from '../../../../translations'
import { Button } from '../../../../components/Button'

interface EmptyMasternodeProps {
  navigation: NavigationProp<MasternodeParamList>
  onRefresh: (nextToken?: string | undefined) => void
  refreshing: boolean
}

export function EmptyMasternode (props: EmptyMasternodeProps): JSX.Element {
  return (
    <ScrollView
      testID='empty_masternode'
      style={tailwind('px-8 pt-32 pb-2 text-center')}
      refreshControl={
        <RefreshControl refreshing={props.refreshing} onRefresh={props.onRefresh} />
      }
    >
      <MaterialIcons name='assignment-late' size={44} style={tailwind('pb-5 text-center text-black')} />
      <Text style={tailwind('text-2xl pb-2 font-semibold text-center')}>
        {translate('screens/MasternodesScreen', 'No masternodes yet')}
      </Text>
      <Text style={tailwind('text-sm pb-16 text-center opacity-60')}>
        {translate('screens/MasternodesScreen', 'Start set up masternode with your wallet.')}
      </Text>
      <Button
        testID='button_create_masternode'
        title='Create Masternode'
        onPress={() => props.navigation.navigate('MasternodeCreate')}
        label={translate('screens/MasternodesScreen', 'CREATE MASTERNODE')}
      />
    </ScrollView>
  )
}
