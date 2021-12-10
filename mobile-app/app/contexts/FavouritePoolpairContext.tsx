import React, { createContext, useContext, useEffect, useState } from 'react'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { FavouritePoolpairsPersistence } from '@api/persistence/favourite_poolpairs_storage'

export interface FavouritePoolpairContextI {
  favouritePoolpairs: PoolpairId[]
  isFavouritePoolpair: (id: string) => boolean
  setFavouritePoolpair: (id: string) => void
}

export interface PoolpairId {
  id: string
}

const FavouritePoolpairContext = createContext<FavouritePoolpairContextI>(undefined as any)

/**
 * Set favourite poolpair to be display in DEX screen
 */
export function useFavouritePoolpairContext (): FavouritePoolpairContextI {
  return useContext(FavouritePoolpairContext)
}

export function FavouritePoolpairProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
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

  const context: FavouritePoolpairContextI = {
    favouritePoolpairs: favouritePoolpairs,
    isFavouritePoolpair: (id: string) => favouritePoolpairs.some(poolpair => poolpair.id === id),
    setFavouritePoolpair: updateFavouritePoolpairs
  }

  return (
    <FavouritePoolpairContext.Provider value={context}>
      {props.children}
    </FavouritePoolpairContext.Provider>
  )
}
