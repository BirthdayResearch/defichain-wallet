import React from 'react'
import { StyleProp, StyleSheet, Text as DefaultText, TextStyle } from 'react-native'

export enum FontFaces {
  LightFont = 'LightFont',
  RegularFont = 'RegularFont',
  MediumFont = 'MediumFont',
  SemiBoldFont = 'SemiBoldFont',
  BoldFont = 'BoldFont'
}

export type FontWeight = 'light' | 'regular' | 'medium' | 'semibold' | 'bold'

export const HeaderFont = { headerTitleStyle: { fontFamily: FontFaces.SemiBoldFont } }

const Default = StyleSheet.create({
  text: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FontFaces.RegularFont
  }
})

export type TextProps = DefaultText['props'] & { fontWeight?: FontWeight }

export function Text (props: TextProps): JSX.Element {
  const { style, fontWeight, ...otherProps } = props
  const weight = {
    fontWeight: '400',
    fontFamily: FontFaces.RegularFont
  }
  switch (fontWeight) {
    case 'light':
      weight.fontWeight = '300'
      weight.fontFamily = FontFaces.LightFont
      break
    case 'regular':
      weight.fontWeight = '400'
      weight.fontFamily = FontFaces.RegularFont
      break
    case 'medium':
      weight.fontWeight = '500'
      weight.fontFamily = FontFaces.MediumFont
      break
    case 'semibold':
      weight.fontWeight = '600'
      weight.fontFamily = FontFaces.SemiBoldFont
      break
    case 'bold':
      weight.fontWeight = '700'
      weight.fontFamily = FontFaces.BoldFont
      break
  }

  return <DefaultText style={[Default.text, style, weight as StyleProp<TextStyle>]} {...otherProps} />
}
