/* eslint-disable @typescript-eslint/no-unused-vars */
import { memo, useCallback, useRef, useState } from 'react'
import * as React from 'react'
import { tailwind } from '@tailwind'
import { Platform, TouchableOpacity, View } from 'react-native'
import { ThemedIcon, ThemedScrollView, ThemedText, ThemedTouchableOpacity, ThemedView } from '../themed'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { BottomSheetNavScreen, BottomSheetWithNavRouteParam, BottomSheetWebWithNav, BottomSheetWithNav } from '@components/BottomSheetWithNav'
import { translate } from '@translations'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { AddOrRemoveCollateralResponse } from '@screens/AppNavigator/screens/Loans/components/AddOrRemoveCollateralForm'
import { isValidIBAN } from 'ibantools'
import { Control, Controller, useForm } from 'react-hook-form'
import { WalletTextInput } from '@components/WalletTextInput'
import { SellRoute } from '@shared-api/dfx/models/SellRoute'
import { BottomSheetFiatPicker, FiatType } from './BottomSheetFiatPicker'

interface BottomSheetFiatAccountCreateProps {
  headerLabel: string
  onCloseButtonPress: () => void
  onElementCreatePress?: (fiatAccount: FiatAccount) => void
  navigateToScreen?: {
    screenName: string
    onButtonPress: (item: AddOrRemoveCollateralResponse) => void // TODO remove
  }
  fiatAccounts: SellRoute[]
}

interface FiatAccount {
  iban: string
  currency: FiatType
}

function checkIban (iban: string): boolean {
  // remove whitespaces
  iban = iban.replace(/\s/g, '')
  return isValidIBAN(iban)
}

export const BottomSheetFiatAccountCreate = ({
  headerLabel,
  onCloseButtonPress,
  onElementCreatePress,
  navigateToScreen
}: BottomSheetFiatAccountCreateProps): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
  const { isLight } = useThemeContext()
  const navigation = useNavigation<NavigationProp<BottomSheetWithNavRouteParam>>()
  const {
    control,
    formState
    // setValue,
    // getValues,
    // trigger
  } = useForm({ mode: 'onChange' })

  const [fiatType, setfiatType] = useState<FiatType>('EUR')

  // fiat picker modal setup
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

  // modal scrollView setup
  const bottomSheetComponents = {
    mobile: BottomSheetScrollView,
    web: ThemedScrollView
  }

  // fiat picker modal => open / return
  const setBottomSheet = useCallback(() => {
    setBottomSheetScreen([
      {
        stackScreenName: 'FiatAccountList',
        component: BottomSheetFiatPicker({
          onFiatPress: async (fiatType): Promise<void> => {
            if (fiatType !== undefined) {
              setfiatType(fiatType)
            }
            dismissModal()
          }
        }),
        option: {
          header: () => null
        }
      }])
  }, [])
  const ScrollView = Platform.OS === 'web' ? bottomSheetComponents.web : bottomSheetComponents.mobile

  const onSubmit = async (): Promise<void> => console.log('submit')

  return (
    <ScrollView
      style={tailwind(['p-4 flex-1', {
        'bg-white': isLight,
        'bg-dfxblue-800': !isLight
      }])}
    >
      <ThemedView
        light={tailwind('bg-white border-gray-200')}
        dark={tailwind('bg-dfxblue-800 border-dfxblue-900')}
        style={tailwind('flex flex-row justify-between items-center px-4 py-2 border-b', { 'py-3.5 border-t -mb-px': Platform.OS === 'android' })} // border top on android to handle 1px of horizontal transparent line when scroll past header
      >
        <ThemedText
          style={tailwind('text-lg font-medium')}
        >
          {headerLabel}
        </ThemedText>
        <TouchableOpacity onPress={onCloseButtonPress}>
          <ThemedIcon iconType='MaterialIcons' name='close' size={20} />
        </TouchableOpacity>
      </ThemedView>

      <View style={tailwind('px-4')}>

        <FiatPickerRow
          fiatType={fiatType}
          onPress={() => {
            setBottomSheet()
            expandModal()
          }}
        />

        <IbanInput
          control={control}
          onAmountChange={async (amount) => {
            // setValue('amount', amount, { shouldDirty: true })
            // await trigger('amount')
          }}
          onClearButtonPress={async () => {
            // setValue('amount', '')
            // await trigger('amount')
          }}
        />

        <View style={tailwind('my-6')}>
          <SubmitButtonGroup
            isDisabled={!formState.isValid /* || token === undefined */}
            label={translate('screens/SellScreen', 'CONTINUE')}
            processingLabel={translate('screens/SellScreen', 'CONTINUE')}
            onSubmit={onSubmit}
            title='sell_continue'
            // isProcessing={hasPendingJob || hasPendingBroadcastJob}
            displayCancelBtn={false}
          />
        </View>

        {Platform.OS === 'web' && (
          <BottomSheetWebWithNav
            modalRef={containerRef}
            screenList={bottomSheetScreen}
            isModalDisplayed={isModalDisplayed}
            modalStyle={{
              position: 'absolute',
              height: '350px',
              width: '375px',
              zIndex: 50,
              bottom: '0'
            }}
          />
        )}

        {Platform.OS !== 'web' && (
          <BottomSheetWithNav
            modalRef={bottomSheetRef}
            screenList={bottomSheetScreen}
          />
        )}
      </View>
    </ScrollView>
  )
})

function FiatPickerRow (props: { fiatType: FiatType, onPress: () => void}): JSX.Element {
  return (
    <>
      <ThemedText
        testID='transaction_details_info_text'
        light={tailwind('text-gray-600')}
        dark={tailwind('text-dfxgray-300')}
        style={tailwind('flex-grow')}
      >
        {translate('screens/SellScreen', 'Select Currency')}
      </ThemedText>

      <ThemedTouchableOpacity
        onPress={props.onPress}
        dark={tailwind('bg-dfxblue-900 border-dfxblue-900')}
        light={tailwind('border-gray-300 bg-white')}
        style={tailwind('border rounded w-full flex flex-row justify-between h-12 items-center px-2 mb-4')}
        testID='select_fiatAccount_input'
      >
        <View style={tailwind('flex flex-row')}>
          <ThemedText
            style={tailwind('ml-2 font-medium')}
            testID='selected_fiatAccount'
          >
            {props.fiatType}
          </ThemedText>
        </View>
        <ThemedIcon
          iconType='MaterialIcons'
          name='unfold-more'
          size={24}
          dark={tailwind('text-dfxred-500')}
          light={tailwind('text-primary-500')}
          style={tailwind('-mr-1.5 flex-shrink-0')}
        />
      </ThemedTouchableOpacity>
    </>
  )
}

interface IbanForm {
  control: Control
  onAmountChange: (amount: string) => void
  onClearButtonPress: () => void
}

function IbanInput ({
  control,
  onAmountChange,
  onClearButtonPress
}: IbanForm): JSX.Element {
  return (
    <>
      <Controller
        control={control}
        name='iban'
        render={({
          field: {
            onChange,
            value
          }
        }) => (
          <ThemedView
            dark={tailwind('bg-transparent')}
            light={tailwind('bg-transparent')}
            style={tailwind('flex-row w-full')}
          >
            <WalletTextInput
              autoCapitalize='characters'
              onChange={onChange}
              onChangeText={onAmountChange}
              placeholder={translate('screens/SendScreen', 'IBAN: XX 0000 0000 0000 00')}
              style={tailwind('flex-grow w-2/5')}
              testID='iban_input'
              value={value}
              maxLength={34}
              displayClearButton={value !== ''}
              onClearButtonPress={onClearButtonPress}
              title={translate('screens/SendScreen', 'How much do you want to send?')}
              titleTestID='title_send'
              inputType='default'
              hasBottomSheet
            />
          </ThemedView>
        )}
        rules={{
          required: true,
          // pattern: /^\d*\.?\d*$/,
          validate: {
            isValidAddress: (iban: string) => isValidIBAN(iban.replace(/\s/g, ''))
          }
        }}
      />
    </>
  )
}
