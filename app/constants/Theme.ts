import { MaterialIcons } from '@expo/vector-icons'
import { DefaultTheme } from '@react-navigation/native'
import { Theme } from '@react-navigation/native/lib/typescript/src/types'
import * as React from 'react'
import { StyleSheet } from 'react-native'

/**
 * @deprecated
 */
export const PrimaryColor = '#ff00af'

/**
 * @deprecated
 */
export const PrimaryColorStyle = StyleSheet.create({
  bg: {
    backgroundColor: PrimaryColor
  },
  text: {
    color: PrimaryColor
  },
  border: {
    borderColor: PrimaryColor
  }
})

/**
 * @deprecated
 */
export const DeFiChainTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: PrimaryColor
  }
}

/**
 * @deprecated
 */
export const VectorIcon = MaterialIcons

/**
 * @deprecated
 */
export type VectorIconName = React.ComponentProps<typeof MaterialIcons>['name']
