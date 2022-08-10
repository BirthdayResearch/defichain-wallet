import { useFavouritePoolpairs } from '@screens/AppNavigator/screens/Dex/hook/FavouritePoolpairs'
import { ThemedIcon, ThemedTouchableOpacityV2 } from '@components/themed'
import { tailwind } from '@tailwind'

export function FavoriteButton ({ poolpairId }: {poolpairId: string}): JSX.Element {
  const { isFavouritePoolpair, setFavouritePoolpair } = useFavouritePoolpairs()
  const isFavouritePair = isFavouritePoolpair(poolpairId)

  return (
    <ThemedTouchableOpacityV2
      onPress={() => setFavouritePoolpair(poolpairId)}
      style={tailwind('rounded-full  flex items-center justify-center w-5 h-5')}
      dark={tailwind('bg-mono-dark-v2-100')}
      light={tailwind('bg-mono-light-v2-100')}
    >
      <ThemedIcon
        iconType='MaterialIcons'
        name={isFavouritePair ? 'star' : 'star-outline'}
        dark={tailwind('text-mono-dark-v2-900')}
        light={tailwind('text-mono-light-v2-900')}
        style={tailwind('text-center')}
        size={12}
      />
    </ThemedTouchableOpacityV2>
  )
}
