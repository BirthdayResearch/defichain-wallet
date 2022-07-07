import { memo, useCallback, useEffect, useRef, useState } from 'react'
import * as React from 'react'
import { tailwind } from '@tailwind'
import { Platform, TouchableOpacity, View } from 'react-native'
import { ThemedActivityIndicator, ThemedIcon, ThemedScrollView, ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { BottomSheetNavScreen, BottomSheetWebWithNav, BottomSheetWithNav } from '@components/BottomSheetWithNav'
import { translate } from '@translations'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { isValidIBAN } from 'ibantools'
import { Control, Controller, useForm } from 'react-hook-form'
import { WalletTextInput } from '@components/WalletTextInput'
import { SellRoute } from '@shared-api/dfx/models/SellRoute'
import { BottomSheetFiatPicker } from './BottomSheetFiatPicker'
import { Fiat } from '@shared-api/dfx/models/Fiat'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { getFiats, postSellRoute } from '@shared-api/dfx/ApiService'
import { WalletAlertErrorApi } from '@components/WalletAlert'

interface BottomSheetFiatAccountCreateProps {
  headerLabel: string
  onCloseButtonPress: () => void
  onElementCreatePress: (fiatAccount: SellRoute) => void
  fiatAccounts: SellRoute[]
}

export const BottomSheetFiatAccountCreate = ({
  headerLabel,
  onCloseButtonPress,
  onElementCreatePress
}: BottomSheetFiatAccountCreateProps): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
  const { isLight } = useThemeContext()
  const {
    control,
    formState,
    setValue,
    getValues,
    trigger
  } = useForm({ mode: 'onChange' })

  const initialFiat: Fiat = {
    id: 2,
    name: 'EUR',
    enable: true
  }

  // from server
  const [fiats, setFiats] = useState<Fiat[]>()
  // returned from picker
  const [fiatType, setfiatType] = useState<Fiat>(initialFiat)

  const [isSubmitting, setIsSubmitting] = useState(false)

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
          },
          onCloseModal: () => dismissModal(),
          fiats: fiats
        }),
        option: {
          header: () => null
        }
      }])
  }, [fiats])
  const ScrollView = Platform.OS === 'web' ? bottomSheetComponents.web : bottomSheetComponents.mobile

  const onSubmit = async (): Promise<void> => {
    setIsSubmitting(true)

    const iban: string = getValues('iban')
    const sellData = { iban: iban, fiat: fiatType }

    postSellRoute(sellData)
      .then((sellRoute) => onElementCreatePress(sellRoute))
      .catch((error) => {
        WalletAlertErrorApi(error)
      })
      .finally(() => setIsSubmitting(false))
  }

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
          selectedFiat={fiatType.name}
          onPress={() => {
            setBottomSheet()
            expandModal()
          }}
          loadedFiats={(fiats) => {
            setFiats(fiats)
          }}
        />

        <IbanInput
          control={control}
          onAmountChange={async (iban) => {
            setValue('iban', iban, { shouldDirty: true })
            await trigger('iban')
          }}
          onClearButtonPress={async () => {
            setValue('iban', '')
            await trigger('iban')
          }}
        />

        <View style={tailwind('my-6')}>
          <SubmitButtonGroup
            isDisabled={!formState.isValid}
            label={translate('components/Button', 'CONTINUE')}
            processingLabel={translate('components/Button', 'CONTINUE')}
            onSubmit={onSubmit}
            title='sell_continue'
            isProcessing={isSubmitting}
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

function FiatPickerRow (props: { selectedFiat: Fiat['name'], loadedFiats: (selected: Fiat[]) => void, onPress: () => void}): JSX.Element {
  const [isLoading, setIsLoading] = useState(false)
  const logger = useLogger()

  useEffect(() => {
    setIsLoading(true)

    getFiats()
      .then((fiats) => {
        props.loadedFiats(fiats)
      })
      .catch(logger.error)
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <>
      <ThemedText
        testID='transaction_details_info_text'
        light={tailwind('text-gray-600')}
        dark={tailwind('text-dfxgray-300')}
        style={tailwind('flex-grow mt-4')}
      >
        {translate('screens/SellScreen', 'Your Currency')}
      </ThemedText>

      {isLoading
        ? (
          <ThemedActivityIndicator style={tailwind('mb-4')} />)
        : (
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
                {props.selectedFiat}
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
      )}
    </>
  )
}

interface IbanForm {
  control: Control
  onAmountChange: (iban: string) => void
  onClearButtonPress: () => void
}

function IbanInput ({
  control,
  onAmountChange,
  onClearButtonPress
}: IbanForm): JSX.Element {
  // TODO: (thabrad) activate if needed (-> if keyboard bug comes back 🤷‍♂️)
  // const { shouldHandleKeyboardEvents } = useBottomSheetInternal()
  // const handleOnFocus = useCallback(
  //   () => {
  //     if (Platform.OS === 'ios') {
  //       shouldHandleKeyboardEvents.value = true
  //     }
  //   },
  //   [shouldHandleKeyboardEvents]
  // )
  // const handleOnBlur = useCallback(
  //   () => {
  //     if (Platform.OS === 'ios') {
  //       shouldHandleKeyboardEvents.value = true
  //     }
  //   },
  //   [shouldHandleKeyboardEvents]
  // )

  return (
    <Controller
      control={control}
      name='iban'
      render={({
        field: { onChange, value }, fieldState: { error }
      }) => (
        <ThemedView
          dark={tailwind('bg-transparent')}
          light={tailwind('bg-transparent')}
          style={tailwind('flex-row w-full')}
        >
          <WalletTextInput
            autoCapitalize='characters'
            // pasteButton={{
            //   isPasteDisabled: false,
            //   onPasteButtonPress: async () => {
            //     value = await Clipboard.getString()
            //   }
            // }}
            onChange={onChange}
            onChangeText={onAmountChange}
            placeholder='IBAN: XX 0000 0000 0000 00'
            style={tailwind('flex-grow w-2/5')}
            testID='iban_input'
            value={value}
            maxLength={34}
            displayClearButton={value !== ''}
            onClearButtonPress={onClearButtonPress}
            title={translate('screens/SellScreen', 'IBAN')}
            titleTestID='title_send'
            inputType='default'
            hasBottomSheet
            inlineText={{
              type: 'error',
              text: error?.message
            }}
            // onBlur={handleOnBlur}
            // onFocus={handleOnFocus}
          />
        </ThemedView>
      )}
      rules={{
        required: true,
        validate: {
          isValidAddress: (iban: string) => {
            return isValidIBAN(iban.replace(/\s/g, ''))
          }
        }
      }}
    />
  )
}
