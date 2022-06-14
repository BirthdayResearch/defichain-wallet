import { ThemedText } from "@components/themed";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { Dispatch, SetStateAction } from "react";
import { TouchableOpacity } from "react-native";

interface UnlockButtonProps {
  isUnlocked: boolean
  setIsUnlocked: Dispatch<SetStateAction<boolean>>
}

export function UnlockButton ( { isUnlocked, setIsUnlocked }: UnlockButtonProps): JSX.Element {
  return (
    <TouchableOpacity
      style={tailwind('pr-4')}
      onPress={() => {
        //TODO: set auth
        setIsUnlocked(true)
      }}
    >
      <ThemedText
        light={tailwind('text-primary-500')}
        dark={tailwind('text-darkprimary-500')}
        style={tailwind('font-medium')}
        testID='composite_swap'
      >
        {translate('screens/ServiceProviderScreen', 'UNLOCK')}
      </ThemedText>
    </TouchableOpacity>
  )
}