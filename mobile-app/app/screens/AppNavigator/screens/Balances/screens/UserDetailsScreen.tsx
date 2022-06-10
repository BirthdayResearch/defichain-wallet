/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import BtnDobby from '@assets/images/dfx_buttons/btn_dobby.png'
import { InputHelperText } from '@components/InputHelperText'
import { WalletTextInput } from '@components/WalletTextInput'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Control, Controller, FieldValues, UseControllerProps, useForm } from 'react-hook-form'
import { Platform, Image, View, Text, TouchableOpacity, KeyboardTypeOptions } from 'react-native'
import {
  ThemedIcon,
  ThemedScrollView,
  ThemedSectionTitle,
  ThemedText,
  ThemedTextInput,
  ThemedView
} from '@components/themed'
import { RootState } from '@store'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { SymbolIcon } from '@components/SymbolIcon'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { BottomSheetNavScreen, BottomSheetWebWithNav, BottomSheetWithNav } from '@components/BottomSheetWithNav'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { useDFXAPIContext } from '@shared-contexts/DFXAPIContextProvider'
import { BottomSheetCountryPicker } from '@components/SellComponents/BottomSheetCountryPicker'
import { BalanceParamList } from '../BalancesNavigator'
import { Country } from '@shared-api/dfx/models/Country'
import { putKycData, putUser } from '@shared-api/dfx/ApiService'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { KycData } from '@shared-api/dfx/models/KycData'
import { AccountType, User, UserDetail } from '@shared-api/dfx/models/User'
import { DFXPersistence } from '@api/persistence/dfx_storage'
import { CommonActions, StackActions } from '@react-navigation/native'
import { ButtonGroup } from '../../Dex/components/ButtonGroup'
import { Language } from '@shared-api/dfx/models/Language'

type Props = StackScreenProps<BalanceParamList, 'UserDetailsScreen'>

interface FormData {
  firstName: string
  lastName: string
  street: string
  zip: number
  email: string
  phone: string
}

export function UserDetailsScreen ({
  route,
  navigation
}: Props): JSX.Element {
  const logger = useLogger()
  const { listFiatAccounts } = useDFXAPIContext()
  const [iconClicked, setIconClicked] = useState(true)

  // TODO: (thabrad) refactor
  enum ButtonGroupTabKey {
    Personal = '0',
    BUSINESS = '1',
    SOLE_PROPRIETORSHIP = '2'
  }

  const buttonOptions = [{
      id: ButtonGroupTabKey.Personal,
      label: AccountType.PERSONAL,
      handleOnPress: () => setSelectedButton(ButtonGroupTabKey.Personal)
    }, {
      id: ButtonGroupTabKey.BUSINESS,
      label: AccountType.BUSINESS,
      handleOnPress: () => setSelectedButton(ButtonGroupTabKey.BUSINESS)
    }, {
      id: ButtonGroupTabKey.SOLE_PROPRIETORSHIP,
      label: AccountType.SOLE_PROPRIETORSHIP,
      handleOnPress: () => setSelectedButton(ButtonGroupTabKey.SOLE_PROPRIETORSHIP)
    }
  ]
  const [selectedButton, setSelectedButton] = useState(ButtonGroupTabKey.Personal)
  // const onButtonGroupChange = (buttonGroupTabKey: ButtonGroupTabKey): void => {
  //   if (selectedButton !== undefined) {
  //     setSelectedButton(buttonGroupTabKey)
  //   }
  // }

  const schema = yup.object({
    firstName: yup.string().required(),
    lastName: yup.string().required(),
    street: yup.string().required(),
    zip: yup.number().positive().integer().max(6).required(),
    city: yup.number().positive().integer().required(),
    email: yup.string().email().required(),
    phone: yup.string().max(15).required()
  }).required()
  const {
    control,
    register,
    setValue,
    formState: { errors, isValid },
    getValues, trigger,
    handleSubmit
  } = useForm/* <User & KycData> */({ mode: 'onChange', resolver: yupResolver(schema) })

  const { listCountries } = useDFXAPIContext()
  const [countries, setCountries] = useState<Country[]>([])
  const defaultCountry = { id: 99334, name: 'Germany', symbol: 'string', enable: true }
  const [country, setCountry] = useState<Country>(defaultCountry)
  const [loadingText, setloadingText] = useState<string>('…loading country list')
  const [isloading, setIsLoading] = useState<boolean>(true)

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

  const setBottomSheet = useCallback(() => {
    setBottomSheetScreen([
      {
        stackScreenName: 'SheetFiatPicker',
        component: BottomSheetCountryPicker({
          onItemPress: async (item): Promise<void> => {
            setCountry(item)
            dismissModal()
          },
          countries: countries,
          onCloseButtonPress: () => dismissModal()
        }),
        option: {
          header: () => null
        }
      }])
  }, [countries])

  // TODO: (thabrad) type fix
  // const x = <User extends any>(firstName: keyof User): any => firstName

  enum Fields{
    accountType = 'accountType',
    firstName = 'firstName',
    lastName = 'lastName',
    street = 'street',
    houseNumber = 'houseNumber',
    zip = 'zip',
    location = 'location',
    country = 'country',
    organizationName = 'organizationName',
    organizationStreet = 'organizationStreet',
    organizationHouseNumber = 'organizationHouseNumber',
    organizationLocation = 'organizationLocation',
    organizationZip = 'organizationZip',
    organizationCountry = 'organizationCountry',
    email = 'mail',
    phone = 'phone'
  }

  async function onSubmit (data: FormData | FieldValues): Promise<void> {
    // TODO quick & dirty --> clean up
    let type
    switch (selectedButton) {
      case ButtonGroupTabKey.Personal:
        type = AccountType.PERSONAL
        break
      case ButtonGroupTabKey.BUSINESS:
        type = AccountType.BUSINESS
        break
      case ButtonGroupTabKey.SOLE_PROPRIETORSHIP:
        type = AccountType.SOLE_PROPRIETORSHIP
        break
      default:
        type = AccountType.PERSONAL
        break
    }

    const kycData: KycData = {
      accountType: type,
      firstName: getValues(Fields.firstName),
      lastName: getValues(Fields.lastName),
      street: getValues(Fields.street),
      houseNumber: getValues(Fields.houseNumber),
      zip: getValues(Fields.zip),
      location: getValues(Fields.location),
      country: country,
      organizationName: getValues(Fields.organizationName),
      organizationStreet: getValues(Fields.organizationStreet),
      organizationHouseNumber: getValues(Fields.organizationHouseNumber),
      organizationLocation: getValues(Fields.organizationLocation),
      organizationZip: getValues(Fields.organizationZip),
      organizationCountry: country
    }
    const userData: User = {
      usedRef: 'string',
      refFeePercent: 0,
      mail: 'string',
      phone: 'string',
      language: {} as Language,
      currency: {}
    }

    setIsLoading(true)
    setloadingText('SENDING')
    putKycData((kycData))
      .then((x) => {
        // console.log(x)
        void (async () => await DFXPersistence.setUserInfoComplete())()
        // navigation.reset()
        navigation.popToTop()
        navigation.navigate('Sell')

        putUser(userData)
          .then(() => {})
          .catch(() => {})
          .finally(() => {
            setIsLoading(false)
            setloadingText('SUCCESS')
          })
      })
      .catch((er) => console.log('ERROR', er))
  }

  // load available countries
  useEffect(() => {
    listCountries()
      .then((fetchedCountries) => {
        setCountries(fetchedCountries)
        setIsLoading(false)
        setloadingText('Submit')
      })
      .catch(logger.error)
  }, [])

  if (!iconClicked) {
    return (
      <TouchableOpacity onPress={() => setIconClicked(true)} style={tailwind('h-full w-full')}>
        <Image
          source={BtnDobby}
          style={tailwind('max-h-full max-w-full')}
        />
      </TouchableOpacity>
    )
  }

  return (
    <View style={tailwind('h-full')} ref={containerRef}>
      <ThemedScrollView
        style={tailwind('flex-1 pb-8')}
        testID='setting_screen'
      >
        <ThemedView style={tailwind('mt-6 rounded-3xl self-center')}>
          <ButtonGroup
            buttons={buttonOptions}
            activeButtonGroupItem={selectedButton}
            modalStyle={tailwind('text-lg')}
            testID='portfolio_button_group'
            darkThemeStyle={tailwind('bg-dfxblue-800')}
            customActiveStyle={{
              dark: tailwind('bg-dfxblue-900')
            }}
          />
        </ThemedView>

        {(selectedButton === ButtonGroupTabKey.BUSINESS || selectedButton === ButtonGroupTabKey.SOLE_PROPRIETORSHIP) &&
          <>
            <ThemedSectionTitle
              testID='network_title'
              text={translate('screens/UserDetails', 'ORGANIZATION DATA')}
            />
            <View style={tailwind('mx-4 bg-dfxblue-800 rounded-md border border-dfxblue-900')}>
              <AddressDetailItem control={control} fieldName={Fields.organizationName} title='Name' example='DFX Inc.' />
              <AddressDetailItem control={control} fieldName={Fields.organizationStreet} title='Street Name' example='Main Street' />
              <AddressDetailItem control={control} fieldName={Fields.organizationHouseNumber} title='Street Number' example='42' keyboardType='number-pad' />
              <AddressDetailItem control={control} fieldName={Fields.organizationZip} title='Zip Code' example='1234' keyboardType='number-pad' />
              <AddressDetailItem control={control} fieldName={Fields.organizationLocation} title='City' example='Berlin' />

              <View style={tailwind('h-12 flex-row border-b border-dfxblue-900')}>
                <Text style={tailwind('ml-4 self-center text-sm text-gray-400')}>
                  {translate('screens/UserDetails', 'Country')}
                </Text>
                <Text
                  style={tailwind('ml-4 flex-grow self-center text-sm text-white')}
                  onPress={() => {
                      // this event only triggers on web
                      setBottomSheet()
                      expandModal()
                    }}
                >
                  {country?.name ?? 'Germany'}
                </Text>
              </View>
            </View>
          </>}

        <ThemedSectionTitle
          testID='network_title'
          text={translate('screens/UserDetails', 'PERSONAL INFORMATION')}
        />
        <View style={tailwind('mx-4 bg-dfxblue-800 rounded-md border border-dfxblue-900')}>

          <AddressDetailItem fieldName={Fields.firstName} control={control} title='First Name' example='John' />
          <AddressDetailItem fieldName={Fields.lastName} control={control} title='Last Name' example='Doe' />
          <AddressDetailItem fieldName={Fields.street} control={control} title='Street Name' example='Main Street' />
          <AddressDetailItem fieldName={Fields.houseNumber} control={control} title='House Number' example='42' keyboardType='number-pad' />
          <AddressDetailItem fieldName={Fields.zip} control={control} title='Zip Code' example='1234' keyboardType='number-pad' />
          <AddressDetailItem fieldName={Fields.location} control={control} title='City' example='Berlin' />

          <View style={tailwind('h-12 flex-row border-b border-dfxblue-900')}>
            <Text style={tailwind('ml-4 self-center text-sm text-gray-400')}>
              {translate('screens/UserDetails', 'Country')}
            </Text>
            <Text
              style={tailwind('ml-4 flex-grow self-center text-sm text-white')}
              onPress={() => {
                // this event only triggers on web
                setBottomSheet()
                expandModal()
              }}
            >
              {country?.name ?? 'Germany'}
            </Text>
          </View>
        </View>

        <ThemedSectionTitle
          testID='contact_data_title'
          text={translate('screens/UserDetails', 'CONTACT DATA')}
        />
        <View style={tailwind('mx-4 bg-dfxblue-800 rounded-md border border-dfxblue-900')}>
          <AddressDetailItem fieldName={Fields.email} control={control} title='Email' example='John.Doe@gmail.com' keyboardType='email-address' />
          <AddressDetailItem fieldName={Fields.phone} control={control} title='Phone Number' example='+4977001234' keyboardType='phone-pad' />
          {
            // errors.map((item: any) => item != null && <ThemedText>This is required.</ThemedText>)
          }
          {isValid ?? <ThemedText>This is required.</ThemedText>}
        </View>

        <View style={tailwind('h-12')} />
        <SubmitButtonGroup
          isDisabled={isloading /* !formState.isValid */}
          label={translate('screens/SellScreen', 'SUBMIT')}
          processingLabel={translate('screens/SellScreen', loadingText)}
          onSubmit={handleSubmit(onSubmit, onSubmit)}
          title='sell_continue'
          isProcessing={isloading}
          displayCancelBtn={false}
        />

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
      </ThemedScrollView>
    </View>
  )
}

interface AddressDetailProps {
  dropdownOptions: any
}

function AddressDetailItem ({
  control,
  fieldName,
  title,
  required = true,
  example,
  keyboardType,
  props
}: { control: Control, fieldName: string, title: string, required?: boolean, example?: string, keyboardType?: KeyboardTypeOptions, props?: AddressDetailProps & UseControllerProps<FormData> }): JSX.Element {
  return (

    <View style={tailwind('h-12 flex-row border-b border-dfxblue-900')}>

      <Text style={tailwind('ml-4 self-center text-sm text-gray-400')}>
        {translate('screens/UserDetails', title)}
      </Text>

      <Controller
        control={control}
        // defaultValue={defaultValue}
        name={fieldName}
        render={({
          field: {
            onBlur,
            onChange,
            value
          }
        }) => (
          <ThemedTextInput
            autoCapitalize='words'
            style={tailwind('ml-4 flex-grow')}
            onBlur={onBlur}
            onChangeText={onChange}
            // onEndEditing={() => console.log(control._fields)}
            value={value}
            placeholder={example}
            keyboardType={keyboardType ?? 'default'}
          />
        )}
        rules={{
          required: required,
          // pattern: /^\d*\.?\d*$/,
          // max: maxAmount,
          validate: {
            // greaterThanZero: (value: string) => new BigNumber(value !== undefined && value !== '' ? value : 0).isGreaterThan(0)
          }
        }}
      />

      {/* {errors. && <Text>This is required.</Text>} */}
    </View>
  )
}
