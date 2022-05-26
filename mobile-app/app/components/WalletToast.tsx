import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { ToastProps } from 'react-native-toast-notifications/lib/typescript/toast'
import { ThemedText, ThemedView } from './themed'
import { StyleSheet } from 'react-native'

interface WalletToastProps {
  toast: ToastProps
}

export function WalletToast (props: WalletToastProps): JSX.Element {
  return (
    <ThemedView
      style={tailwind('pb-1.5 pt-1 px-4 mt-16 rounded-3xl')}
      dark={[styles.darkShadow, tailwind('bg-gray-700')]}
      light={[styles.lightShadow, tailwind('bg-white')]}
      testID='wallet_toast'
    >
      <ThemedText
        style={tailwind('text-lg')}
        dark={tailwind('text-gray-50')}
        light={tailwind('text-gray-900')}
      >
        {translate('components/WalletToast', props.toast.message as string)}
      </ThemedText>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  darkShadow: {
    boxShadow: '0px 0px 0px 1px rgba(0, 0, 0, 0.1), 0px 40px 32px -16px rgba(0, 0, 0, 0.05), 0px 6px 4px -4px rgba(0, 0, 0, 0.12), 0px 16px 16px -8px rgba(0, 0, 0, 0.12)'
  },
  lightShadow: {
    boxShadow: '0px 0px 0px 1px rgba(0, 0, 0, 0.05), 0px 40px 35px -16px rgba(0, 0, 0, 0.08), 0px 6px 4px -4px rgba(0, 0, 0, 0.06), 0px 16px 16px -8px rgba(0, 0, 0, 0.12)'
  }
})
