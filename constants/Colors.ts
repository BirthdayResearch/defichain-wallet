import { StyleSheet } from 'react-native'

// TODO(fuxingloh): deprecate this file
const tintColorDark = '#fff'

export const PrimaryColor = '#ff00af'

export const PrimaryColorStyle = StyleSheet.create({
  bg: {
    backgroundColor: '#ff00af'
  },
  text: {
    color: '#ff00af'
  }
})

export const Colors = {
  light: {
    text: '#000',
    background: '#fff',
    tint: PrimaryColor,
    tabIconDefault: '#ccc',
    tabIconSelected: PrimaryColor
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark
  }
}
