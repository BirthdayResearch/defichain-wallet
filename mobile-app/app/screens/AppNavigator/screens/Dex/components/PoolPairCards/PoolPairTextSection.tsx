import { TouchableOpacity, View } from 'react-native'
import { ThemedIcon, ThemedText } from '@components/themed'
import { tailwind } from '@tailwind'
import { getNativeIcon } from '@components/icons/assets'

interface PoolPairTextSectionProps {
  symbolA: string
  symbolB: string
  pairId: string
  isFavouritePair: boolean
  setFavouritePoolpair: (id: string) => void
}

export function PoolPairTextSection ({
  symbolA,
  symbolB,
  pairId,
  isFavouritePair,
  setFavouritePoolpair
}: PoolPairTextSectionProps): JSX.Element {
  const poolpairSymbol = `${symbolA}-${symbolB}`
  return (
    <View style={tailwind('flex-row items-center')}>
      <PoolPairIcon symbolA={symbolA} symbolB={symbolB} />
      <ThemedText
        style={tailwind('text-lg font-medium')}
        testID={`your_symbol_${poolpairSymbol}`}
      >
        {poolpairSymbol}
      </ThemedText>
      <View style={tailwind('flex justify-end')}>
        <TouchableOpacity
          onPress={() => setFavouritePoolpair(pairId)}
          style={tailwind('p-1.5 flex-row items-center')}
          testID={`favorite_${poolpairSymbol}`}
        >
          <ThemedIcon
            iconType='MaterialIcons'
            name={isFavouritePair ? 'star' : 'star-outline'}
            onPress={() => setFavouritePoolpair(pairId)}
            size={20}
            light={tailwind(
              isFavouritePair ? 'text-warning-500' : 'text-gray-600'
            )}
            dark={tailwind(
              isFavouritePair ? 'text-darkwarning-500' : 'text-gray-300'
            )}
            style={tailwind('')}
          />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export function PoolPairIcon (props: {
  symbolA: string
  symbolB: string
}): JSX.Element {
  const IconA = getNativeIcon(props.symbolA)
  const IconB = getNativeIcon(props.symbolB)
  return (
    <>
      <IconA height={24} width={24} style={tailwind('relative z-10 -mt-3')} />
      <IconB height={24} width={24} style={tailwind('-ml-4 mt-1 mr-3')} />
    </>
  )
}
