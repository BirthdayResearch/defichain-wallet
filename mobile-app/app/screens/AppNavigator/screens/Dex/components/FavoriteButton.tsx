import { useFavouritePoolpairs } from '@screens/AppNavigator/screens/Dex/hook/FavouritePoolpairs'
import { ThemedIcon, ThemedTouchableOpacityV2 } from '@components/themed'
import { tailwind } from '@tailwind'

export function FavoriteButton ({ pairId }: {pairId: string}): JSX.Element {
  const { isFavouritePoolpair, setFavouritePoolpair } = useFavouritePoolpairs()
  const isFavouritePair = isFavouritePoolpair(pairId)

  return (
    <ThemedTouchableOpacityV2
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
      <ThemedIcon
        iconType='MaterialIcons'
        name='star'
        dark={tailwind({
          'text-mono-dark-v2-900': !isFavouritePair,
          'text-mono-light-v2-100': isFavouritePair
        })}
        light={tailwind({
          'text-mono-light-v2-900': !isFavouritePair,
          'text-mono-light-v2-100': isFavouritePair
        })}
        style={tailwind('text-center')}
        size={14}
      />
    </ThemedTouchableOpacityV2>
  )
}
