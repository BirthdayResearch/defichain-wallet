import { ThemedProps, ThemedTouchableOpacityV2 } from '@components/themed'
import { getColor, tailwind } from '@tailwind'
import { FavoriteCheckIcon } from '@screens/AppNavigator/screens/Settings/assets/FavoriteIcon'
import { StyleProp, ViewProps } from 'react-native'

interface FavoriteIconsProps {
  pairId: string
  isFavouritePair: boolean
  onPress: () => void
  customSize?: number
  themedStyle?: ThemedProps
  additionalStyle?: StyleProp<ViewProps>
}
export function FavoriteButton ({
  pairId,
  isFavouritePair,
  onPress,
  themedStyle,
  additionalStyle = tailwind('w-5 h-5'),
  customSize = 14
}: FavoriteIconsProps): JSX.Element {
  const themed = themedStyle ?? {
    dark: tailwind({
      'bg-mono-dark-v2-100': !isFavouritePair,
      'bg-brand-v2-500': isFavouritePair
    }),
    light: tailwind({
      'bg-mono-light-v2-100': !isFavouritePair,
      'bg-brand-v2-500': isFavouritePair
    })
  }
  return (
    <ThemedTouchableOpacityV2
      {...themed}
      testID={`favorite_pair_${pairId}`}
      onPress={onPress}
      style={[tailwind('rounded-full flex items-center justify-center'), additionalStyle]}
    >
      <FavoriteCheckIcon
        size={customSize}
        dark={isFavouritePair ? getColor('mono-dark-v2-100') : getColor('mono-dark-v2-900')}
        light={isFavouritePair ? getColor('mono-light-v2-100') : getColor('mono-light-v2-900')}
      />
    </ThemedTouchableOpacityV2>
  )
}
