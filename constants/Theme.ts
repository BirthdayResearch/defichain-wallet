import { MaterialIcons } from '@expo/vector-icons'
import { DefaultTheme } from '@react-navigation/native'
import { Theme } from '@react-navigation/native/lib/typescript/src/types'
import * as React from 'react'
import { StyleSheet } from 'react-native'

export const PrimaryColor = '#ff00af'

export const PrimaryColorStyle = StyleSheet.create({
  bg: {
    backgroundColor: PrimaryColor
  },
  text: {
    color: PrimaryColor
  },
  border: {
    borderColor: PrimaryColor
  },
  button: {
    backgroundColor: PrimaryColor,
    color: '#ffffff'
  }
})

export const DisabledColorStyle = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    color: 'rgba(255,255,255,0.06)'
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
