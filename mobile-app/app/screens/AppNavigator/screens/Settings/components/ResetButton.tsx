import { ThemedText } from "@components/themed";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { TouchableOpacity } from "react-native";

export function ResetButton (): JSX.Element {
  return (
    <TouchableOpacity
      style={tailwind('pr-4')}
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