import { DefaultTheme } from '@react-navigation/native'
import { Theme } from '@react-navigation/native/lib/typescript/src/types'
import { StyleSheet } from 'react-native'

export const PrimaryColor = '#ff00af'

export const PrimaryColorStyle = StyleSheet.create({
  bg: {
    backgroundColor: '#ff00af'
  },
  text: {
    color: '#ff00af'
  }
})

export const DeFiChainTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: PrimaryColor
  }
}
