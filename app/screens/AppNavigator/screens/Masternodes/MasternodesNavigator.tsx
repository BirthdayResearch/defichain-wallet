import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'
import { HeaderFont } from '../../../../components/Text'
import { translate } from '../../../../translations'
import { MasternodesScreen, Masternode } from './MasternodesScreen'
import { MasternodeDetailScreen } from './MasternodeDetailScreen'

export interface MasternodeParamList {
  MasternodesScreen: undefined
  MasternodeDetailScreen: {
    masternode: Masternode
  }

  [key: string]: undefined | object
}

const MasternodesStack = createStackNavigator<MasternodeParamList>()

export function MasternodesNavigator (): JSX.Element {
  return (
    <MasternodesStack.Navigator
      initialRouteName='Masternodes'
      screenOptions={{ headerTitleStyle: HeaderFont }}
    >
      <MasternodesStack.Screen
        name='Masternodes'
        component={MasternodesScreen}
        options={{
          headerTitle: translate('screens/MasternodesScreen', 'Masternodes')
        }}
      />
      <MasternodesStack.Screen
        name='MasternodeDetail'
        component={MasternodeDetailScreen}
        options={{
          headerTitle: translate('screens/MasternodeDetailScreen', 'Masternode'),
          headerBackTitleVisible: false
        }}
      />
    </MasternodesStack.Navigator>
  )
}
