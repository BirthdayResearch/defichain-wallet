import { useCallback, useEffect, useState } from 'react'
import { Dimensions, Platform, Text, View } from 'react-native'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { ThemedScrollViewV2, ThemedIcon, ThemedSectionTitleV2, ThemedTouchableOpacityV2 } from '@components/themed'
import { ResetButtonV2 } from '../components/ResetButtonV2'
import { ButtonV2 } from '@components/ButtonV2'
import { authentication, Authentication } from '@store/authentication'
import { MnemonicStorage } from '@api/wallet/mnemonic_storage'
import { StackScreenProps } from '@react-navigation/stack'
import { useAppDispatch } from '@hooks/useAppDispatch'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { SettingsParamList } from '../SettingsNavigator'
import { useServiceProviderContext } from '@contexts/StoreServiceProvider'
import { useWalletNodeContext } from '@shared-contexts/WalletNodeProvider'
import { WalletTextInputV2 } from '@components/WalletTextInputV2'

type Props = StackScreenProps<SettingsParamList, 'ServiceProviderScreen'>

export function ServiceProviderScreen ({ navigation }: Props): JSX.Element {
  const logger = useLogger()
  const dispatch = useAppDispatch()
  // show all content for small screen and web to adjust margins and paddings
  const isSmallScreen = Platform.OS === 'web' || Dimensions.get('window').height <= 667
  const {
    url,
    defaultUrl,
    setUrl
  } = useServiceProviderContext()

  const [labelInput, setLabelInput] = useState<string>(url)
  const [isValid, setIsValid] = useState<boolean>(false)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState<string>('')
  const [displayTickIcon, setDisplayTickIcon] = useState<boolean>(true)

  // Passcode prompt
  const { data: { type: encryptionType } } = useWalletNodeContext()
  const isEncrypted = encryptionType === 'MNEMONIC_ENCRYPTED'
  const submitCustomServiceProvider = useCallback(async (): Promise<void> => {
    if (!isEncrypted) {
      return
    }

    const auth: Authentication<string[]> = {
      consume: async passphrase => await MnemonicStorage.get(passphrase),
      onAuthenticated: async () => {
        await setUrl(labelInput)
        navigation.pop()
      },
      onError: e => logger.error(e),
      title: translate('screens/ServiceProviderScreen', 'Adding custom service provider'),
      message: translate('screens/ServiceProviderScreen', 'Enter passcode to continue'),
      loading: translate('screens/ServiceProviderScreen', 'Verifying access'),
      additionalMessage: translate('screens/ServiceProviderScreen', 'Custom'),
      additionalMessageUrl: labelInput
    }
    dispatch(authentication.actions.prompt(auth))
  }, [dispatch, isEncrypted, navigation, labelInput])

  const validateInputlabel = (input: string): boolean => {
    if (input === '' || !(/^https/.test(input))) {
      setIsValid(false)
      setErrMsg('Invalid URL')
      return false
    }
    setErrMsg('')
    setIsValid(true)
    return true
  }

  // to enable continue button
  useEffect(() => {
    if (validateInputlabel(labelInput)) {
      return setIsValid(true)
    }
    return setIsValid(false)
  }, [labelInput])

  // hide err msg when input is empty
  useEffect(() => {
    if (labelInput === '') {
      return setErrMsg('')
    }
  }, [labelInput])

  // clear input on unlock and not display warning msg
  useEffect(() => {
    if (isUnlocked && url === defaultUrl) {
      return setLabelInput('')
    }
  }, [isUnlocked])

  // to display tick icon
  useEffect(() => {
    if (!isUnlocked && isValid) {
      return setDisplayTickIcon(true)
    } else if (labelInput === '' && !isValid) {
      return setDisplayTickIcon(false)
    }
  }, [labelInput, isValid])

  return (
    <ThemedScrollViewV2
      contentContainerStyle={tailwind('px-5 pb-16')}
      style={tailwind('flex-1')}
    >
      <ThemedSectionTitleV2
        testID='endpoint_url_title'
        text={translate('screens/ServiceProviderScreen', 'ENDPOINT URL')}
      />
      <View
        style={tailwind('flex flex-row items-center w-full')}
      >
        <WalletTextInputV2
          valid={errMsg === ''}
          editable={isUnlocked}
          value={labelInput}
          inputType='default'
          onChangeText={(_text: string) => {
            setLabelInput(_text)
            validateInputlabel(_text)
          }}
          onClearButtonPress={() => {
            setLabelInput('')
            validateInputlabel('')
          }}
          placeholder={translate('screens/ServiceProviderScreen', defaultUrl)}
          style={tailwind('font-normal-v2 flex-1 py-2.5')}
          containerStyle='flex-1'
          testID='endpoint_url_input'
          inlineText={{
            type: 'error',
            text: translate('screens/ServiceProviderScreen', errMsg)
          }}
          displayClearButton={labelInput !== '' && labelInput !== undefined && isUnlocked && !displayTickIcon}
          displayTickIcon={displayTickIcon}
        />
        <ThemedTouchableOpacityV2
          onPress={() => setIsUnlocked(true)}
          light={tailwind('bg-mono-light-v2-900', { 'bg-opacity-30': isUnlocked })}
          dark={tailwind('bg-mono-dark-v2-900', { 'bg-opacity-30': isUnlocked })}
          style={tailwind('ml-3 h-10 w-10 p-2.5 text-center rounded-full')}
          disabled={isUnlocked}
          testID='edit_service_provider'
        >
          <ThemedIcon
            dark={tailwind('text-mono-dark-v2-100')}
            light={tailwind('text-mono-light-v2-100')}
            iconType='Feather'
            name='edit-2'
            size={18}
          />
        </ThemedTouchableOpacityV2>
      </View>
      {isUnlocked && (
        <>
          <View style={tailwind('mt-2 px-5 mb-6')}>
            <Text style={tailwind('text-orange-v2 font-normal-v2 text-xs')}>
              {translate('screens/ServiceProviderScreen', 'Only add URLs that are fully trusted and secured. Adding malicious service providers may result in irrecoverable funds. Changes do not take effect until you manually restart the app.')}
            </Text>
          </View>
          <ResetButtonV2 />
        </>
      )}
      {isUnlocked && (
        <View style={tailwind('mt-48', { 'mt-36': isSmallScreen })}>
          <ButtonV2
            styleProps='mx-7 mt-2'
            label={translate('screens/ServiceProviderScreen', 'Continue')}
            testID='button_submit'
            onPress={async () => await submitCustomServiceProvider()}
            disabled={!isValid}
          />
        </View>
      )}
    </ThemedScrollViewV2>
  )
}
