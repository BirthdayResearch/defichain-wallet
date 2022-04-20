import { HeaderTitle } from '@components/HeaderTitle'
import { createStackNavigator } from '@react-navigation/stack'
import { translate } from '@translations'
import { RecoveryWordsScreen } from '../Settings/screens/RecoveryWordsScreen'
import { LegacyScreen } from './LegacyScreen'

export interface LegacyParamList {
  LegacyScreen: {}
  [key: string]: undefined | object
}

const LegacyStack = createStackNavigator<LegacyParamList>()

export function LegacyNavigator (): JSX.Element {
  const headerContainerTestId = 'legacy_header_container'

  return (
    <LegacyStack.Navigator
      initialRouteName='LegacyScreen'
      screenOptions={{
        headerBackTitleVisible: false
      }}
    >
      <LegacyStack.Screen
        component={LegacyScreen}
        name='LegacyScreen'
        options={{
          headerShown: false
        }}
      />
      <LegacyStack.Screen
        component={RecoveryWordsScreen}
        name='RecoveryWordsScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/Settings', 'View Recovery Words')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />
    </LegacyStack.Navigator>
  )
}
