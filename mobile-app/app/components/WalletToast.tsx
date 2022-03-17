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
      style={tailwind('py-1.5 px-4 mt-8 rounded-lg')}
      light={tailwind('bg-gray-600')}
      dark={tailwind('bg-gray-300')}
    >
      <ThemedText
        style={tailwind('text-lg')}
        light={tailwind('text-white')}
        dark={tailwind('text-black')}
      >
        {translate('components/WalletToast', props.toast.message as string)}
      </ThemedText>
    </ThemedView>
  )
}
