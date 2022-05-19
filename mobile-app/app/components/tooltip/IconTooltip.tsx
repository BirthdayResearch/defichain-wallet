import React from 'react'
import { TouchableOpacity } from 'react-native'
import Popover, { PopoverPlacement } from 'react-native-popover-view'
import { translate } from '@translations'
import { ThemedIcon, ThemedText } from '@components/themed'
import { tailwind } from '@tailwind'

export function IconTooltip (): JSX.Element {
  // TODO: pass in custom measurements for displayArea prop for android
  return (
    <Popover
      // displayArea={{ x: 0, y: 150, height: 150, width: 250 }}
      // verticalOffset={Platform.OS === 'android' ? -25 : 0} // -StatusBar.currentHeight
      placement={PopoverPlacement.AUTO}
      popoverStyle={tailwind('bg-gray-800')}
      from={(
        <TouchableOpacity>
          <ThemedIcon
            style={tailwind('pl-1')}
            size={16}
            name='language'
            iconType='MaterialIcons'
            dark={tailwind('text-gray-200')}
            light={tailwind('text-gray-700')}
          />
        </TouchableOpacity>
      )}
    >
      <ThemedText
        style={tailwind('p-3 text-sm')}
        light={tailwind('text-white')}
        dark={tailwind('text-white')}
      >
        {translate('screens/BalancesScreen', 'This icon indicates that the price is provided by Oracles instead of the DEX')}
      </ThemedText>
    </Popover>
  )
}
