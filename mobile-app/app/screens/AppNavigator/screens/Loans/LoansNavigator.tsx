import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { translate } from '@translations'
import { HeaderFont } from '@components/Text'
import { HeaderTitle } from '@components/HeaderTitle'
import { LoansScreen } from './screens/LoansScreen'
import { NetworkDetails } from '../Settings/screens/NetworkDetails'

export interface LoansParamList {
  LoansScreen: undefined
  [key: string]: undefined | object
}

const LoansStack = createStackNavigator<LoansParamList>()

export function LoansNavigator (): JSX.Element {
  const headerContainerTestId = 'loans_header_container'

  return (
    <LoansStack.Navigator
      initialRouteName='LoansScreen'
      screenOptions={{
        headerTitleStyle: HeaderFont,
        headerTitleAlign: 'center'
      }}
    >
      <LoansStack.Screen
        component={LoansScreen}
        name='LoansScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/LoansScreen', 'Loans')}
              containerTestID={headerContainerTestId}
            />
          )
        }}
      />
      <LoansStack.Screen
        component={NetworkDetails}
        name='NetworkDetails'
        options={{
          headerTitle: translate('screens/NetworkDetails', 'Wallet Network'),
          headerBackTitleVisible: false,
          headerBackTestID: 'network_details_header_back'
        }}
      />
    </LoansStack.Navigator>
  )
}
