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
      style={tailwind('py-2 px-4 mt-16 rounded-3xl')}
      dark={tailwind('bg-green-v2')}
      light={tailwind('bg-green-v2')}
      testID='wallet_toast'
    >
      <ThemedText
        style={tailwind('font-normal-v2 text-xs')}
        dark={tailwind('text-mono-dark-v2-00')}
        light={tailwind('text-mono-dark-v2-00')}
      >
        {translate('components/WalletToast', props.toast.message as string)}
      </ThemedText>
    </ThemedView>
  )
}
