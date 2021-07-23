import React from 'react'
import { StyleSheet, Text as DefaultText } from 'react-native'
import { tailwind } from '../tailwind'

export enum FontFaces {
  LightFont = 'LightFont',
  RegularFont = 'RegularFont',
  MediumFont = 'MediumFont',
  SemiBoldFont = 'SemiBoldFont',
  BoldFont = 'BoldFont'
}

export const Default = StyleSheet.create({
  text: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: FontFaces.RegularFont
  }
})

export type FontWeight = 'light' | 'regular' | 'medium' | 'semibold' | 'bold'

export const HeaderFont = { headerTitleStyle: { fontFamily: FontFaces.SemiBoldFont } }

export type TextProps = DefaultText['props'] & { fontWeight?: FontWeight }

export function Text (props: TextProps): JSX.Element {
  const { style, fontWeight, ...otherProps } = props
  return (
    <DefaultText
      style={[tailwind('font-normal text-base'), style]} {...otherProps}
    />
  )
}
