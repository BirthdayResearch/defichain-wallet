import { FavouritePoolpairsPersistence } from '@api/persistence/favourite_poolpairs_storage'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useEffect, useState } from 'react'

export interface FavouritePoolpair {
  favouritePoolpairs: PoolpairId[]
  isFavouritePoolpair: (id: string) => boolean
  setFavouritePoolpair: (id: string) => void
}

export interface PoolpairId {
  id: string
}

export function useFavouritePoolpairs (): FavouritePoolpair {
  const logger = useLogger()
  const [favouritePoolpairs, setFavouritePoolpairs] = useState<PoolpairId[]>([])

  useEffect(() => {
    FavouritePoolpairsPersistence.get().then((poolpair) => {
      setFavouritePoolpairs(poolpair)
    }).catch(logger.error)
  }, [])

  const updateFavouritePoolpairs = async (id: string): Promise<void> => {
    const _poolpair = favouritePoolpairs.find(poolpair => poolpair.id === id)
    let newPoolpairs: PoolpairId[] = []
    if (_poolpair === undefined) {
      newPoolpairs = [...favouritePoolpairs, {
        id
      }]
    } else {
      newPoolpairs = favouritePoolpairs.filter(poolpair => poolpair.id !== id)
    }

    setFavouritePoolpairs(newPoolpairs)
    await FavouritePoolpairsPersistence.set(newPoolpairs)
  }

  return {
    favouritePoolpairs: favouritePoolpairs,
    isFavouritePoolpair: (id: string) => favouritePoolpairs.some(poolpair => poolpair.id === id),
    setFavouritePoolpair: updateFavouritePoolpairs
  }
}
