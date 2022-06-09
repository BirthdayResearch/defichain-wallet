import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { ToastProps } from 'react-native-toast-notifications/lib/typescript/toast'
import { ThemedText, ThemedView } from './themed'

interface WalletToastProps {
  toast: ToastProps
}

export function WalletToast (props: WalletToastProps): JSX.Element {
  return (
    <ThemedView
      style={tailwind('pb-1.5 pt-1 px-4 mt-16 rounded-3xl')}
      dark={tailwind('bg-dfxblue-800')}
      light={tailwind('bg-gray-600')}
      testID='wallet_toast'
    >
      <ThemedText
        style={tailwind('text-lg')}
        dark={tailwind('text-gray-50')}
        light={tailwind('text-white')}
      >
        {translate('components/WalletToast', props.toast.message as string)}
      </ThemedText>
    </ThemedView>
  )
}
