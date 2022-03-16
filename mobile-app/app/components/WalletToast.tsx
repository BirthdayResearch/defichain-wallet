import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { ToastProps } from 'react-native-toast-notifications/lib/typescript/toast'
import { ThemedText, ThemedView } from './themed'

type WalletToastType = 'success'

interface WalletToastProps {
  type: WalletToastType
  toast: ToastProps
}

export function WalletToast (props: WalletToastProps): JSX.Element {
  return (
    <ThemedView
      style={tailwind('p-4 mt-12 rounded-full')}
      light={tailwind('bg-success-500')}
      dark={tailwind('bg-darksuccess-500')}
    >
      <ThemedText
        style={tailwind('text-sm font-medium')}
      >
        {translate('components/WalletToast', props.toast.message as string)}
      </ThemedText>
    </ThemedView>
  )
}
