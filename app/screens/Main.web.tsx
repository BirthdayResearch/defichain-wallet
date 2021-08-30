import { NavigationContainer } from '@react-navigation/native'
import { Theme } from '@react-navigation/native/lib/typescript/src/types'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { getDefaultTheme } from '../constants/Theme'
import { useThemeContext } from '../contexts/ThemeProvider'
import { tailwind } from '../tailwind'
import { PlaygroundNavigator } from './PlaygroundNavigator/PlaygroundNavigator'
import { RootNavigator } from './RootNavigator'

export function Main (): JSX.Element {
  const { isLight } = useThemeContext()
  const DeFiChainTheme: Theme = getDefaultTheme(isLight)
  return (
    <View style={tailwind('flex-row flex-1 justify-center items-center bg-black')}>
      <View style={styles.phone}>
        <RootNavigator />
      </View>
      <View style={[styles.phone, tailwind('bg-white ml-2')]}>
        <NavigationContainer theme={DeFiChainTheme}>
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
