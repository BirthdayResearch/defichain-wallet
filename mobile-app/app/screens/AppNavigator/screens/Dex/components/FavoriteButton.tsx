import { ThemedTouchableOpacityV2 } from '@components/themed'
import { getColor, tailwind } from '@tailwind'
import { FavoriteCheckIcon } from '@screens/AppNavigator/screens/Settings/assets/FavoriteIcon'

interface FavoriteIconsProps {
  pairId: string
  isFavouritePair: boolean
  setFavouritePoolpair: (id: string) => void
}
export function FavoriteButton ({ pairId, isFavouritePair, setFavouritePoolpair }: FavoriteIconsProps): JSX.Element {
  return (
    <ThemedTouchableOpacityV2
      testID={`favorite_pair_${pairId}`}
      onPress={() => setFavouritePoolpair(pairId)}
      style={tailwind('rounded-full  flex items-center justify-center w-5 h-5')}
      dark={tailwind({
        'bg-mono-dark-v2-100': !isFavouritePair,
        'bg-brand-v2-500': isFavouritePair
      })}
      light={tailwind({
        'bg-mono-light-v2-100': !isFavouritePair,
        'bg-brand-v2-500': isFavouritePair
      })}
    >
      <FavoriteCheckIcon
        size={14}
        dark={isFavouritePair ? getColor('mono-dark-v2-100') : getColor('mono-dark-v2-900')}
        light={isFavouritePair ? getColor('mono-light-v2-100') : getColor('mono-light-v2-900')}
      />
    </ThemedTouchableOpacityV2>
  )
}
