import { tailwind } from '@tailwind'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import { ThemedIcon } from './themed'

export function HeaderSearchIcon (props: {onPress: () => void}): JSX.Element {
  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={tailwind('pr-4')}
    >
      <ThemedIcon
        light={tailwind('text-primary-500')}
        dark={tailwind('text-darkprimary-500')}
        iconType='MaterialIcons'
        name='search'
        size={24}
      />
    </TouchableOpacity>
  )
}
