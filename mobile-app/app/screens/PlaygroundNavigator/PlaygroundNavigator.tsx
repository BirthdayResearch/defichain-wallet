import { createStackNavigator } from '@react-navigation/stack'

import { HeaderFont } from '../../components'
import { HeaderTitle } from '@components/HeaderTitle'
import { PlaygroundProvider } from '@contexts/PlaygroundContext'
import { PlaygroundScreen } from './PlaygroundScreen'

export interface PlaygroundParamList {
  PlaygroundScreen: undefined

  [key: string]: undefined | object
}

const PlaygroundStack = createStackNavigator<PlaygroundParamList>()

export function PlaygroundNavigator (): JSX.Element {
  return (
    <PlaygroundProvider>
      <PlaygroundStack.Navigator screenOptions={{ headerTitleStyle: HeaderFont, presentation: 'modal', headerTitleAlign: 'center' }}>
        <PlaygroundStack.Screen
          component={PlaygroundScreen}
          name='PlaygroundScreen'
          options={{
            headerTitle: () => <HeaderTitle text='DeFi Testing' containerTestID='playground_header_container' />,
            headerBackTitleVisible: false
          }}
        />
      </PlaygroundStack.Navigator>
    </PlaygroundProvider>
  )
}
