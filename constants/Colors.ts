import { StyleSheet } from 'react-native'

const tintColorLight = '#2f95dc'
const tintColorDark = '#fff'

export const Colors = {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark
  }
}

export const PrimaryColor = '#ff00af'

export const PrimaryColorStyle = StyleSheet.create({
  bg: {
    backgroundColor: '#ff00af'
  },
  text: {
    color: '#ff00af'
  }
})
