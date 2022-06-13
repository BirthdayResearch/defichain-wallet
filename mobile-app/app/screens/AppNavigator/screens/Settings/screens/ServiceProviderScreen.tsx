import { useState } from 'react'
import { View } from 'react-native'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { ThemedScrollView, ThemedText } from '@components/themed'
import { WalletTextInput } from '@components/WalletTextInput'

export function ServiceProviderScreen (): JSX.Element {
    const [labelInput] = useState('https://ocean.defichain.com')

    return (
      <ThemedScrollView light={tailwind('bg-white')} style={tailwind('px-4')}>
        <View style={tailwind('flex-1 mt-4 mb-8')}>
          <ThemedText
            style={tailwind('text-xs font-medium')}
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
            hasBottomSheet
            testID='endpoint_url_input'
          />
        </View>
      </ThemedScrollView>
    )
}
