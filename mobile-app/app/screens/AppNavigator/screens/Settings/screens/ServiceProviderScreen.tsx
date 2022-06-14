import { useLayoutEffect, useState } from 'react'
import { View } from 'react-native'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { ThemedScrollView, ThemedText, ThemedView, ThemedIcon } from '@components/themed'
import { WalletTextInput } from '@components/WalletTextInput'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { ResetButton } from '../components/ResetButton'
import { UnlockButton } from '../components/UnlockButton'
interface ServiceProviderParamList {

}

export function ServiceProviderScreen(): JSX.Element {
  const [labelInput] = useState('https://ocean.defichain.com')
  const navigation = useNavigation<NavigationProp<ServiceProviderParamList>>()
  // TODO: 
  const [isUnlocked, setIsUnlocked] = useState(false)
 
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: (): JSX.Element => {
        if (isUnlocked) {
          return <ResetButton isUnlocked={isUnlocked}/>
        }
        return <UnlockButton isUnlocked={isUnlocked} setIsUnlocked={setIsUnlocked}/>
      }
    })
  })

  return (
    <ThemedScrollView light={tailwind('bg-white')} style={tailwind('px-4')}>
      { isUnlocked && (
        <View style={tailwind('pt-3 flex-1')}>
          <ThemedView
            light={tailwind('bg-warning-100')}
            dark={tailwind('bg-darkwarning-100')}
            style={tailwind('flex flex-row p-2 text-sm font-medium rounded items-center ')}
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
              {translate('screens/RecoveryWordsScreen', 'Adding malicious service providers may result in irrecoverable funds. Please proceed at your own risk.')}
            </ThemedText>
          </ThemedView>
        </View>
        )
      }
      
      <View style={tailwind('flex-1 mt-4 mb-8')}>
        <ThemedText
          style={tailwind('text-sm')}
          light={tailwind('text-gray-400')}
          dark={tailwind('text-gray-500')}
        >
          {translate('screens/ServiceProviderScreen', 'Endpoint URL')}
        </ThemedText>
        <WalletTextInput
          value={labelInput}
          inputType='default'
          onChangeText={(_text: string) => {
          }}
          onClearButtonPress={() => {
          }}
          placeholder={translate('screens/ServiceProviderScreen', 'https://ocean.defichain.com')}
          style={tailwind('h-9 w-6/12 flex-grow')}
          // hasBottomSheet
          testID='endpoint_url_input'
        />
        { isUnlocked && (
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
      </View>
    </ThemedScrollView>
  )
}
