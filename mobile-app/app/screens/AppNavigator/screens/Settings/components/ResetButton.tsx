import { ThemedText } from "@components/themed";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { WalletAlert } from "@components/WalletAlert";
import { TouchableOpacity } from "react-native";

interface ResetButtonProps {
  isUnlocked: boolean
}

export function ResetButton ( { isUnlocked }: ResetButtonProps): JSX.Element {
  const onPress = async (): Promise<void> => {
    WalletAlert({
      title: translate('screens/Settings', 'Reset Service Provider'),
      message: translate('screens/Settings', 'In doing so, you will be reverted back to Light wallet\'s default endpoint. Would you like to continue?'),
      buttons: [
        {
          text: translate('screens/ServiceProviderScreen', 'Go back'),
          style: 'cancel'
        },
        {
          text: translate('screens/ServiceProviderScreen', 'Reset'),
          style: 'destructive',
          onPress: async () => {
            // TODO: reset provider
            // navigation.goBack()
          }
        }
      ]
    })
  }
  return (
    <TouchableOpacity
      style={tailwind('pr-4')}
      onPress={onPress}
    >
      <ThemedText
        light={tailwind('text-primary-500')}
        dark={tailwind('text-darkprimary-500')}
        style={tailwind('font-medium')}
        testID='composite_swap'
      >
        {translate('screens/ServiceProviderScreen', 'RESET')}
      </ThemedText>
    </TouchableOpacity>
  )
}