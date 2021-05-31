import React from 'react'
import tailwind from 'tailwind-rn'
import { StyleSheet, View } from 'react-native'
import { RootNavigator } from './RootNavigator'
import { PlaygroundNavigator } from '../playground/Playground'

export function Main (): JSX.Element {
  return (
    <View style={tailwind('flex-row flex-1 justify-center items-center bg-black')}>
      <View style={tailwind('flex-row')}>
        <View style={styles.phone}>
          <RootNavigator />
        </View>
        <View style={[styles.phone, tailwind('bg-white ml-2')]}>
          <PlaygroundNavigator />
        </View>
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
