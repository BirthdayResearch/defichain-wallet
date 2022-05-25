/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { InputHelperText } from '@components/InputHelperText'
import { WalletTextInput } from '@components/WalletTextInput'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Control, Controller, useForm } from 'react-hook-form'
import { Platform, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AmountButtonTypes, SetAmountButton } from '@components/SetAmountButton'
import {
  ThemedIcon,
  ThemedScrollView,
  ThemedSectionTitle,
  ThemedText,
  ThemedTextInput,
  ThemedTouchableOpacity,
  ThemedView
} from '@components/themed'
import { RootState } from '@store'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { SymbolIcon } from '@components/SymbolIcon'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { BottomSheetNavScreen, BottomSheetWebWithNav, BottomSheetWithNav } from '@components/BottomSheetWithNav'
import { BottomSheetToken, BottomSheetTokenList, TokenType } from '@components/BottomSheetTokenList'
import { BottomSheetFiatAccountList } from '@components/SellComponents/BottomSheetFiatAccountList'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { useIsFocused } from '@react-navigation/native'
import { useDFXAPIContext } from '@shared-contexts/DFXAPIContextProvider'
import { ActionButton } from '../../Dex/components/PoolPairCards/ActionSection'
import { BottomSheetFiatAccountCreate } from '@components/SellComponents/BottomSheetFiatAccountCreate'
import { BalanceParamList } from '../BalancesNavigator'
// import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'
// import { isValidIBAN } from 'ibantools'

type Props = StackScreenProps<BalanceParamList, 'UserDetailsScreen'>

export function UserDetailsScreen ({
  route,
  navigation
}: Props): JSX.Element {
  const logger = useLogger()
  const { listFiatAccounts } = useDFXAPIContext()
  const isFocused = useIsFocused()
  const {
    control,
    setValue,
    formState,
    getValues,
    trigger
  } = useForm({ mode: 'onChange' })
  const dispatch = useDispatch()

  // Bottom sheet token
  const [isModalDisplayed, setIsModalDisplayed] = useState(false)
  const [bottomSheetScreen, setBottomSheetScreen] = useState<BottomSheetNavScreen[]>([])
  const containerRef = useRef(null)
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const expandModal = useCallback(() => {
    if (Platform.OS === 'web') {
      setIsModalDisplayed(true)
    } else {
      bottomSheetRef.current?.present()
    }
  }, [])
  const dismissModal = useCallback(() => {
    if (Platform.OS === 'web') {
      setIsModalDisplayed(false)
    } else {
      bottomSheetRef.current?.close()
    }
  }, [])

  // load sell routes
  useEffect(() => {

  }, [])

  // const setFiatAccountListBottomSheet = useCallback((accounts: SellRoute[]) => {
  //   setBottomSheetScreen([
  //     {
  //       stackScreenName: 'FiatAccountList',
  //       component: BottomSheetFiatAccountList({
  //         fiatAccounts: accounts,
  //         headerLabel: translate('screens/UserDetailsScreen', 'Choose account for payout'),
  //         onCloseButtonPress: () => dismissModal(),
  //         onFiatAccountPress: async (item): Promise<void> => {
  //           if (item.iban !== undefined) {
  //             setSelectedFiatAccount(item)
  //             setFee(item.fee)
  //             // setValue('amount', '') // TODO: remove or use
  //             // await trigger('amount')
  //           }
  //           dismissModal()
  //         }
  //       }),
  //       option: {
  //         header: () => null
  //       }
  //     }])
  // }, [])

  // const setFiatAccountCreateBottomSheet = useCallback((accounts: SellRoute[]) => { // TODO: remove accounts?
  //   setBottomSheetScreen([
  //     {
  //       stackScreenName: 'FiatAccountCreate',
  //       component: BottomSheetFiatAccountCreate({
  //         fiatAccounts: accounts,
  //         headerLabel: translate('screens/UserDetailsScreen', 'Add account for payout'),
  //         onCloseButtonPress: () => dismissModal(),
  //         onElementCreatePress: async (item): Promise<void> => {
  //           if (item.iban !== undefined) {
  //             // setSelectedFiatAccount(item)
  //             // setFee(item.fee)
  //             // setValue('amount', '') // TODO: remove
  //             // await trigger('amount')
  //           }
  //           dismissModal()
  //         }
  //       }),
  //       option: {
  //         header: () => null
  //       }
  //     }])
  // }, [])

  async function onSubmit (): Promise<void> {
    // if (hasPendingJob || hasPendingBroadcastJob || token === undefined) {
    //   return
    // }

    // const values = getValues()
    // if (formState.isValid && isConversionRequired) {
    //   queueConvertTransaction({
    //     mode: 'accountToUtxos',
    //     amount: conversionAmount
    //   }, dispatch, () => {
    //     navigation.navigate({
    //       name: 'SellConfirmationScreen',
    //       params: {
    //         destination: values.address,
    //         token,
    //         amount: new BigNumber(values.amount),
    //         fee,
    //         conversion: {
    //           DFIUtxo,
    //           DFIToken,
    //           isConversionRequired,
    //           conversionAmount
    //         }
    //       },
    //       merge: true
    //     })
    //   }, logger)
    // } else if (formState.isValid) {
    //   const values = getValues()
    //   navigation.navigate({
    //     name: 'SellConfirmationScreen',
    //     params: {
    //       destination: values.address,
    //       token,
    //       amount: new BigNumber(values.amount),
    //       fee
    //     },
    //     merge: true
    //   })
    // }
  }

  return (
    <ThemedScrollView
      style={tailwind('flex-1 pb-8')}
      testID='setting_screen'
    >
      <ThemedSectionTitle
        testID='network_title'
        text={translate('screens/UserDetails', 'PERSONAL INFORMATION')}
      />

      <ThemedSectionTitle
        testID='security_title'
        text={translate('screens/UserDetails', 'CONTACT DATA')}
      />
      <NavigateItemRow
        label='Recovery Words'
        testID='view_recovery_words'
      />
      <NavigateItemRow
        label='Change Passcode'
        testID='view_change_passcode'
      />

      <ThemedView style={tailwind('p-4 rounded-lg border-dfxblue-800')}>
        <ThemedTextInput
          style={tailwind('w-full h-12 bg-dfxblue-800')}
        />
        <WalletTextInput
          inputType='default'
          inlineText={{ type: 'error', text: 'some' }}
          placeholder='::::fefe::::'
        />

        <WalletTextInput
          inputType='default'
          title={translate('screens/UserDetails', 'Last Name')}
          inlineText={{ type: 'helper', text: 'John' }}
        />
        <WalletTextInput
          inputType='numeric'
          inlineText={{ type: 'error' }}
        >
          <ThemedText>
            {translate('screens/UserDetails', 'Street')}
          </ThemedText>
        </WalletTextInput>
        <WalletTextInput
          inputType='default'
          title={translate('screens/UserDetails', 'skdfhs')}
        />
        <WalletTextInput
          inputType='numeric'
        />
      </ThemedView>

      <ThemedSectionTitle
        testID='addtional_options_title'
        text={translate('screens/UserDetails', 'ADDITIONAL OPTIONS')}
      />
      <NavigateItemRow
        testID='setting_navigate_About'
        label='About'
        onPress={() => navigation.navigate('Send')}
      />
      <NavigateItemRow
        testID='setting_navigate_language_selection'
        label='back'
        onPress={() => navigation.navigate('Sell')}
      />
      {/* <RowExitWalletItem /> */}
    </ThemedScrollView>
  )
}

// function RowExitWalletItem (): JSX.Element {
//   const { clearWallets } = useWalletPersistenceContext()
//   const { clearAddressBook } = useAddressBook()
//   const { clearDfxTokens } = useDFXAPIContext()

//   async function onExitWallet (): Promise<void> {
//     WalletAlert({
//       title: translate('screens/UserDetails', 'Are you sure you want to unlink your wallet?'),
//       message: translate('screens/UserDetails', 'You will need to use your recovery words the next time you want to get back to your wallet.'),
//       buttons: [
//         {
//           text: translate('screens/UserDetails', 'Cancel'),
//           style: 'cancel'
//         },
//         {
//           text: translate('screens/UserDetails', 'Unlink Wallet'),
//           onPress: async () => {
//             clearAddressBook()
//             await clearDfxTokens()
//             await clearWallets()
//           },
//           style: 'destructive'
//         }
//       ]
//     })
//   }

//   return (
//     <ThemedTouchableOpacity
//       onPress={onExitWallet}
//       style={tailwind('flex flex-row p-4 mt-8 mb-8 items-center')}
//       testID='setting_exit_wallet'
//     >
//       <ThemedIcon
//         dark={tailwind('text-dfxred-500')}
//         iconType='MaterialIcons'
//         light={tailwind('text-primary-500')}
//         name='exit-to-app'
//         size={24}
//         style={[tailwind('self-center mr-2'), { transform: [{ scaleX: -1 }] }]}
//       />

//       <ThemedText
//         dark={tailwind('text-dfxred-500')}
//         light={tailwind('text-primary-500')}
//         style={tailwind('font-medium')}
//       >
//         {translate('screens/UserDetails', 'UNLINK WALLET')}
//       </ThemedText>
//     </ThemedTouchableOpacity>
//   )
// }

function NavigateItemRow ({
  testID,
  label,
  onPress
}: { testID: string, label: string, onPress?: () => void }): JSX.Element {
  return (
    <ThemedTouchableOpacity
      onPress={onPress}
      style={tailwind('flex p-4 pr-2 flex-row items-center justify-between')}
      testID={testID}
    >
      <ThemedText style={tailwind('font-medium')}>
        {translate('screens/UserDetails', label)}
      </ThemedText>

      <ThemedIcon
        iconType='MaterialIcons'
        name='chevron-right'
        size={24}
      />
    </ThemedTouchableOpacity>
  )
}
