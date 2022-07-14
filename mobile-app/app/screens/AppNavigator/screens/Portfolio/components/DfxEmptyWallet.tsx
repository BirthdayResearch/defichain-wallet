import { tailwind } from '@tailwind'
import { ThemedText, ThemedView } from '@components/themed'
import { translate } from '@translations'
import { useDFXAPIContext } from '@shared-contexts/DFXAPIContextProvider'
import { TouchableOpacity } from 'react-native'

export function DfxEmptyWallet (): JSX.Element {
    const { openDfxServices } = useDFXAPIContext()

    return (
      <ThemedView
        light={tailwind('bg-gray-50')}
        style={tailwind('px-4 mt-4 pb-2 text-center')}
        testID='dfx_empty_wallet'
      >
        <ThemedText testID='empty_tokens_note' style={tailwind('font-normal text-sm text-center')}>
          {translate('components/DfxEmptyWallet', 'Add your DFI and other dTokens to get started or')}
        </ThemedText>
        <TouchableOpacity onPress={openDfxServices}>
          <ThemedText
            light={tailwind('text-primary-500')}
            dark={tailwind('text-dfxred-500')}
            style={tailwind('pb-1 font-normal text-sm text-center')}
            testID='empty_tokens_note'
          >
            {translate('components/DfxEmptyWallet', 'buy them with a bank transfer')}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    )
}
