import { MaterialIcons } from '@expo/vector-icons'
import { DefaultTheme } from '@react-navigation/native'
import { Theme } from '@react-navigation/native/lib/typescript/src/types'
import * as React from 'react'
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

export const VectorIcon = MaterialIcons
export type VectorIconName = React.ComponentProps<typeof MaterialIcons>['name']
