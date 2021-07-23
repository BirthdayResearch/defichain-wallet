import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useNetworkContext } from '../contexts/NetworkContext'
import { isPlayground } from '../environment'
import { tailwind } from '../tailwind'
import { PlaygroundNavigator } from './PlaygroundNavigator/PlaygroundNavigator'
import { RootNavigator } from './RootNavigator'

export function Main (): JSX.Element {
  const { network } = useNetworkContext()
  const playground = isPlayground(network)

  return (
    <View style={tailwind('flex-row flex-1 justify-center items-center bg-black')}>
      <View style={styles.phone}>
        <RootNavigator />
      </View>
      {
        playground ? (
          <View style={[styles.phone, tailwind('bg-white ml-2')]}>
            <NavigationContainer>
              <PlaygroundNavigator />
            </NavigationContainer>
          </View>
        ) : null
      }
    </View>
  )
}

/**
 * iPhone 8 Size
 */
const styles = StyleSheet.create({
  phone: {
    width: 375,
    height: 667
  }
})
