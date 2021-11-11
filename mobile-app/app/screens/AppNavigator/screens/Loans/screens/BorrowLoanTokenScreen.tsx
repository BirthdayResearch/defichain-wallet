import { ThemedScrollView, ThemedSectionTitle, ThemedText } from '@components/themed'
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
import { Button } from '@components/Button'

type Props = StackScreenProps<LoanParamList, 'BorrowLoanTokenScreen'>

// interface Vault {
//   vaultId: string
//   collateralRatio: BigNumber
//   interest: BigNumber
// }

export function BorrowLoanTokenScreen ({ route, navigation }: Props): JSX.Element {
  const {
    loan
  } = route.params
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
      <ThemedText
        style={tailwind('text-xl font-bold')}
      >
        {translate('screens/BorrowLoanTokenScreen', 'Borrow loan token')}
      </ThemedText>
      <ThemedSectionTitle text={translate('screens/BorrowLoanTokenScreen', 'SELECT LOAN TOKEN')} />
      <ThemedSectionTitle text={translate('screens/BorrowLoanTokenScreen', 'SELECT VAULT FOR COLLATERAL')} />

      <Button
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
      />
      {/* <BottomSheetWithNav
        modalRef={bottomSheetRef}
        screenList={bottomSheetScreen}
      /> */}
    </ThemedScrollView>
  )
}

// interface OptionInputProps {
//   type: OptionInputType
//   id: string
//   columnData: {
//     label: string
//     value: string
//   }[]
//   onPress: () => void
//   isEmpty: boolean
// }

// enum OptionInputType {
//   Loan,
//   Vault
// }

// function OptionInput(props: OptionInputProps): JSX.Element {
//   return (
//     <ThemedView>
//       <TouchableOpacity>

//       </TouchableOpacity>
//     </ThemedView>
//   )
// }
