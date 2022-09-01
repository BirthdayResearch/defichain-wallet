import { FavouritePoolpairsPersistence } from "@api";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import { createContext, useContext, useEffect, useState } from "react";

export interface FavouritePoolpair {
  favouritePoolpairs: PoolpairId[];
  isFavouritePoolpair: (id: string) => boolean;
  setFavouritePoolpair: (id: string) => void;
}

export interface PoolpairId {
  id: string;
}

const FavouritePoolpairContext = createContext<FavouritePoolpair>(
  undefined as any
);

export function useFavouritePoolpairContext(): FavouritePoolpair {
  return useContext(FavouritePoolpairContext);
}

export function FavouritePoolpairProvider(
  props: React.PropsWithChildren<any>
): JSX.Element | null {
  const logger = useLogger();
  const [favouritePoolpairs, setFavouritePoolpairs] = useState<PoolpairId[]>(
    []
  );

  useEffect(() => {
    FavouritePoolpairsPersistence.get()
      .then((poolpair) => {
        setFavouritePoolpairs(poolpair);
      })
      .catch(logger.error);
  }, []);

  const updateFavouritePoolpairs = async (id: string): Promise<void> => {
    const _poolpair = favouritePoolpairs.find((poolpair) => poolpair.id === id);
    let newPoolpairs: PoolpairId[] = [];
    if (_poolpair === undefined) {
      newPoolpairs = [
        ...favouritePoolpairs,
        {
          id,
        },
      ];
    } else {
      newPoolpairs = favouritePoolpairs.filter(
        (poolpair) => poolpair.id !== id
      );
    }
    setFavouritePoolpairs(newPoolpairs);
    await FavouritePoolpairsPersistence.set(newPoolpairs);
  };

  const isFavouritePoolpair = (id: string): boolean =>
    favouritePoolpairs.some((poolpair) => poolpair.id === id);

  const context: FavouritePoolpair = {
    favouritePoolpairs,
    isFavouritePoolpair,
    setFavouritePoolpair: updateFavouritePoolpairs,
  };

  return (
    <FavouritePoolpairContext.Provider value={context}>
      {props.children}
    </FavouritePoolpairContext.Provider>
  );
}
