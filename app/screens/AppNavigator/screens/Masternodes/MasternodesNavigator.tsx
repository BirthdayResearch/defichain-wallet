import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'
import { HeaderFont } from '../../../../components/Text'
import { translate } from '../../../../translations'
import { MasternodesScreen, Masternode } from './MasternodesScreen'
import { MasternodeDetailScreen } from './MasternodeDetailScreen'
import { MasternodeCreateScreen } from './MasternodeCreateScreen'

export interface MasternodeParamList {
  MasternodesScreen: undefined
  MasternodeDetailScreen: {
    masternode: Masternode
  }
  MasternodeCreateScreen: undefined

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
      <MasternodesStack.Screen
        name='MasternodeCreate'
        component={MasternodeCreateScreen}
        options={{
          headerTitle: translate('screens/MasternodeCreateScreen', 'Create Masternode'),
          headerBackTitleVisible: false
        }}
      />
    </MasternodesStack.Navigator>
  )
}
