import { useFavouritePoolpairs } from '@screens/AppNavigator/screens/Dex/hook/FavouritePoolpairs'
import { ThemedTouchableOpacityV2 } from '@components/themed'
import { getColor, tailwind } from '@tailwind'
import { FavoriteCheckIcon } from '@screens/AppNavigator/screens/Settings/assets/FavoriteIcon'

interface FavoriteButtonProps {
  pairId: string
  notFavouriteBgColor?: {
    light: string
    dark: string
  }
}

export function FavoriteButton ({
  pairId,
  notFavouriteBgColor = {
    light: 'bg-mono-light-v2-100',
    dark: 'bg-mono-dark-v2-100'
  }
 }: FavoriteButtonProps): JSX.Element {
  const { isFavouritePoolpair, setFavouritePoolpair } = useFavouritePoolpairs()
  const isFavouritePair = isFavouritePoolpair(pairId)

  return (
    <ThemedTouchableOpacityV2
      onPress={() => setFavouritePoolpair(pairId)}
      style={tailwind('rounded-full  flex items-center justify-center w-5 h-5')}
      dark={tailwind({ 'bg-brand-v2-500': isFavouritePair }, !isFavouritePair && notFavouriteBgColor.dark)}
      light={tailwind({ 'bg-brand-v2-500': isFavouritePair }, !isFavouritePair && notFavouriteBgColor.light)}
    >
      <FavoriteCheckIcon
        size={14}
        dark={isFavouritePair ? getColor('mono-dark-v2-100') : getColor('mono-dark-v2-900')}
        light={isFavouritePair ? getColor('mono-light-v2-100') : getColor('mono-light-v2-900')}
      />
    </ThemedTouchableOpacityV2>
  )
}
