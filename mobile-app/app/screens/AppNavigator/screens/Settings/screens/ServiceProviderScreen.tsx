import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { View } from 'react-native'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { ThemedScrollView, ThemedText, ThemedView, ThemedIcon } from '@components/themed'
import { WalletTextInput } from '@components/WalletTextInput'
import { ResetButton } from '../components/ResetButton'
import { UnlockButton } from '../components/UnlockButton'
import { Button } from '@components/Button'
import { authentication, Authentication } from '@store/authentication'
import { MnemonicStorage } from '@api/wallet/mnemonic_storage'
import { StackScreenProps } from '@react-navigation/stack'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { hasTxQueued } from '@store/transaction_queue'
import { useAppDispatch } from '@hooks/useAppDispatch'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { SettingsParamList } from '../SettingsNavigator'
import { defaultDefichainURL, useServiceProviderContext } from '@contexts/StoreServiceProvider'

type Props = StackScreenProps<SettingsParamList, 'ServiceProviderScreen'>

export function ServiceProviderScreen({ navigation }: Props): JSX.Element {
  const logger = useLogger()
  const dispatch = useAppDispatch()
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))

  const {
    url,
    setUrl
  } = useServiceProviderContext()

  const [labelInput, setLabelInput] = useState<string>(url)
  const [isValid, setIsValid] = useState<boolean>(false)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState<string>('')
  const [displayTickIcon, setDisplayTickIcon] = useState<boolean>(true)

  const submitCustomServiceProvider = useCallback(() => {
    // to check if user's transactions to be completed before changing url
    if (hasPendingJob || hasPendingBroadcastJob) {
      return
    }
    const auth: Authentication<string[]> = {
      consume: async passphrase => await MnemonicStorage.get(passphrase),
      onAuthenticated: async () => {
        setUrl(labelInput)
        navigation.pop()
      },
      onError: e => logger.error(e),
      title: translate('screens/ServiceProviderScreen', 'Adding custom service provider'),
      message: translate('screens/ServiceProviderScreen', 'Enter passcode to continue'),
      loading: translate('screens/ServiceProviderScreen', 'Verifying acess'),
      additionalMessage: translate('screens/ServiceProviderScreen', 'Custom'),
      additionalMessageUrl: labelInput 
    }
    dispatch(authentication.actions.prompt(auth))
  }, [dispatch, navigation, labelInput])

  const validateInputlabel = (input: string): boolean => {
    const exp = new RegExp('^https')
    if (input === '' || !(exp.test(input))) {
      setIsValid(false)
      setErrMsg('Invalid URL')
      return false
    }
    setErrMsg('')
    setIsValid(true)
    return true
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: (): JSX.Element => {
        if (isUnlocked) {
          return <ResetButton />
        }
        return <UnlockButton setIsUnlocked={setIsUnlocked} />
      }
    })
  })

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
    if (isUnlocked) {
      return setLabelInput('')
    }
  }, [isUnlocked])

  // to display tick icon 
  useEffect(() => {
    if (isUnlocked && isValid) {
      return setDisplayTickIcon(true)
    } else if (labelInput === '' && !isValid) {
      return setDisplayTickIcon(false)
    }
  }, [labelInput, isValid])

  return (
    <ThemedScrollView light={tailwind('bg-white')} style={tailwind('px-4')}>
      {isUnlocked && (
        <View style={tailwind('pt-3 flex-1')}>
          <ThemedView
            light={tailwind('bg-warning-100')}
            dark={tailwind('bg-darkwarning-100')}
            style={tailwind('flex flex-row p-2 text-sm font-medium rounded items-center')}
          >
            <ThemedIcon
              dark={tailwind('text-yellow-300')}
              light={tailwind('text-yellow-500')}
              style={tailwind('pr-2')}
              iconType='MaterialIcons'
              name='warning'
              size={15}
            />
            <ThemedText
              light={tailwind('text-gray-500')}
              dark={tailwind('text-white')}
              style={tailwind('text-xs flex-1')}
            >
              {translate('screens/ServiceProviderScreen', 'Adding malicious service providers may result in irrecoverable funds. Please proceed at your own risk.')}
            </ThemedText>
          </ThemedView>
        </View>
      )
      }

      <View style={tailwind('mt-4')}>
        <ThemedText
          style={tailwind('text-sm')}
          light={tailwind('text-gray-400')}
          dark={tailwind('text-gray-500')}
        >
          {translate('screens/ServiceProviderScreen', 'Endpoint URL')}
        </ThemedText>
        <WalletTextInput
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
          placeholder={translate('screens/ServiceProviderScreen', defaultDefichainURL)}
          style={tailwind('h-9 w-6/12 flex-grow')}
          testID='endpoint_url_input'
          inlineText={{
            type: 'error',
            text: translate('screens/ServiceProviderScreen', errMsg)
          }}
          displayClearButton={labelInput !== '' && labelInput !== undefined && isUnlocked}
          displayTickIcon={displayTickIcon}
        />

        {isUnlocked && errMsg === '' && (
          <View style={tailwind('pt-1.5')}>
            <ThemedText
              style={tailwind('text-xs font-medium')}
              light={tailwind('text-gray-400')}
              dark={tailwind('text-gray-500')}
            >
              {translate('screens/ServiceProviderScreen', 'Only add URLs that are fully trusted and secured.')}
            </ThemedText>
          </View>
        )
        }
        {isUnlocked && (
          <View style={tailwind('-m-4 mt-4')}>
            <Button
              label={translate('screens/ServiceProviderScreen', 'CONTINUE')}
              testID='button_submit'
              onPress={submitCustomServiceProvider}
              disabled={!isValid}
            />
          </View>
        )
        }
      </View>
    </ThemedScrollView>
  )
}
