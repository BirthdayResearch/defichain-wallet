import { BottomSheetTokenListRouteParam } from '@components/BottomSheetTokenList'
import { Button } from '@components/Button'
import { SymbolIcon } from '@components/SymbolIcon'
import { ThemedText, ThemedView } from '@components/themed'
import { StackScreenProps } from '@react-navigation/stack'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import React from 'react'
import { View } from 'react-native'
import NumberFormat from 'react-number-format'

export interface AddOrEditCollateralFormProps {
  token: string
  collateralFactor: BigNumber
  available: BigNumber
  onButtonPress: () => void
}

type Props = StackScreenProps<BottomSheetTokenListRouteParam, 'AddOrEditCollateralForm'>

export function AddOrEditCollateralForm ({ route }: Props): JSX.Element {
  const {
    token,
    collateralFactor
  } = route.params
  return (
    <ThemedView>
      <ThemedText>
        {translate('components/AddOrEditCollateralForm', 'How much {{token}} to add?', { token: token })}
      </ThemedText>
      <View style={tailwind('flex flex-row items-center')}>
        <SymbolIcon symbol={token} styleProps={{ width: 24, height: 24 }} />
        <ThemedText
          style={tailwind('mx-2')}
        >
          {token}
        </ThemedText>
        <ThemedView
          light={tailwind('text-gray-700 border-gray-700')}
          dark={tailwind('text-gray-300 border-gray-300')}
          style={tailwind('border rounded')}
        >
          <NumberFormat
            value={collateralFactor.toFixed(2)}
            decimalScale={2}
            displayType='text'
            suffix='%'
            renderText={value =>
              <ThemedText
                light={tailwind('text-gray-700')}
                dark={tailwind('text-gray-300')}
                style={tailwind('text-xs font-medium px-1')}
              >
                {value}
              </ThemedText>}
          />
        </ThemedView>
      </View>
      <Button
        disabled
        label={translate('components/AddOrEditCollateralForm', 'ADD TOKEN AS COLLATERAL')}
        onPress={() => { /* TODO: handle button press */ }}
        margin='mt-8 mb-10'
      />
    </ThemedView>
  )
}
