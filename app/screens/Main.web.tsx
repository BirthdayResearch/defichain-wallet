import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import tailwind from 'tailwind-rn'
import { PlaygroundNavigator } from './PlaygroundNavigator/PlaygroundNavigator'
import { RootNavigator } from './RootNavigator'

export function Main (): JSX.Element {
  return (
    <View style={tailwind('flex-row flex-1 justify-center items-center bg-black')}>
      <View style={styles.phone}>
        <RootNavigator />
      </View>
      <View style={[styles.phone, tailwind('bg-white ml-2')]}>
        <NavigationContainer>
          <PlaygroundNavigator />
        </NavigationContainer>
      </View>
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
