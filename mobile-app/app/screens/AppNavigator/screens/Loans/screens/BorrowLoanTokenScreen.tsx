import { ThemedIcon, ThemedScrollView, ThemedText, ThemedTouchableOpacity } from '@components/themed'
import { StackScreenProps } from '@react-navigation/stack'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import React from 'react'
// import React, { useCallback, useRef, useState } from 'react'
// import BigNumber from 'bignumber.js'
import { LoanParamList } from '../LoansNavigator'
// import { BottomSheetNavScreen, BottomSheetWithNav } from '@components/BottomSheetWithNav'
// import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
// import { TouchableOpacity } from 'react-native'
import { View } from '@components'
import { SymbolIcon } from '@components/SymbolIcon'
import NumberFormat from 'react-number-format'

type Props = StackScreenProps<LoanParamList, 'BorrowLoanTokenScreen'>

// interface Vault {
//   vaultId: string
//   collateralRatio: BigNumber
//   interest: BigNumber
// }

export function BorrowLoanTokenScreen ({ route }: Props): JSX.Element {
  // const {
    // loanTokenId,
    // symbol,
    // displaySymbol,
    // price,
    // currency,
    // interest
  // } = route.params
  // const [vault, setVault] = useState('')
  // const vaultOption = [
  //   {
  //     label: 'vault 1',
  //     value: 'vault 1'
  //   },
  //   {
  //     label: 'vault 2',
  //     value: 'vault 2'
  //   },
  //   {
  //     label: 'vault 3',
  //     value: 'vault 3'
  //   },
  //   {
  //     label: 'vault 4',
  //     value: 'vault 4'
  //   },
  // ]
  // const bottomSheetRef = useRef<BottomSheetModalMethods>(null)
  // const [bottomSheetScreen, setBottomSheetScreen] = useState<BottomSheetNavScreen[]>([])
  // const expandModal = useCallback(() => {
  //   bottomSheetRef.current?.present()
  // }, [])
  // const dismissModal = useCallback(() => {
  //   bottomSheetRef.current?.close()
  // }, [])
  return (
    <ThemedScrollView>
      <View style={tailwind('px-4')}>
        <ThemedText
          style={tailwind('text-xl font-bold mt-6')}
        >
          {translate('screens/BorrowLoanTokenScreen', 'Borrow loan token')}
        </ThemedText>
        <InputLabel text='SELECT LOAN TOKEN' />
        <LoanTokenInput {...route.params} />
        <InputLabel text='SELECT VAULT FOR COLLATERAL' />
      </View>

      {/* <Button
        disabled={false}
        label={translate('screens/BorrowLoanTokenScreen', 'CONTINUE')}
        onPress={() => navigation.navigate({
          name: 'ConfirmBorrowLoanTokenScreen',
          params: {
            loan
          },
          merge: true
        })}
        testID='add_collateral_button'
        margin='my-2'
      /> */}
      {/* <BottomSheetWithNav
        modalRef={bottomSheetRef}
        screenList={bottomSheetScreen}
      /> */}
    </ThemedScrollView>
  )
}

function InputLabel (props: {text: string}): JSX.Element {
  return (
    <ThemedText
      light={tailwind('text-gray-500')}
      dark={tailwind('text-gray-400')}
      style={tailwind('text-xs font-medium mt-4 mb-1')}
    >
      {translate('screens/BorrowLoanTokenScreen', props.text)}
    </ThemedText>
  )
}
interface LoanTokenInputProps {
  loanTokenId: string
  symbol: string
  displaySymbol: string
  price: string
  currency: string
  interest: string
}

function LoanTokenInput (props: LoanTokenInputProps): JSX.Element {
  return (
    <ThemedTouchableOpacity
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('border p-4 flex flex-row items-center justify-between rounded-lg')}
    >
      <View style={tailwind('flex flex-row w-4/12 flex-grow')}>
        <SymbolIcon symbol={props.symbol} styleProps={{ width: 24, height: 24 }} />
        <ThemedText style={tailwind('ml-2 text-sm font-medium')}>{props.displaySymbol}</ThemedText>
      </View>
      <View style={tailwind('mr-8')}>
        <ThemedText
          light={tailwind('text-gray-400')}
          dark={tailwind('text-gray-500')}
          style={tailwind('text-xs')}
        >
          {translate('screens/BorrowLoanTokenScreen', 'Price (USD)')}
        </ThemedText>
        <NumberFormat
          value={props.price}
          decimalScale={2}
          thousandSeparator
          displayType='text'
          renderText={(value) =>
            <>
              <ThemedText style={tailwind('text-sm font-semibold')}>
                {value}
              </ThemedText>
            </>}
          suffix='%'
        />
      </View>
      <View style={tailwind('mr-4')}>
        <ThemedText
          light={tailwind('text-gray-400')}
          dark={tailwind('text-gray-500')}
          style={tailwind('text-xs')}
        >
          {translate('screens/BorrowLoanTokenScreen', 'Interest')}
        </ThemedText>
        <NumberFormat
          value={props.interest}
          decimalScale={2}
          thousandSeparator
          displayType='text'
          renderText={(value) =>
            <>
              <ThemedText style={tailwind('text-sm font-semibold')}>
                {value}
              </ThemedText>
            </>}
          suffix='%'
        />
      </View>
      <ThemedIcon
        iconType='MaterialIcons'
        name='unfold-more'
        size={24}
        light={tailwind('text-primary-500')}
        dark={tailwind('text-darkprimary-500')}
      />
    </ThemedTouchableOpacity>
  )
}
