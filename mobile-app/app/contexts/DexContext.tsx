import React, { createContext, useContext, useEffect, useState } from 'react'
import { DisplayDexGuidelinesPersistence, Logging } from '@api'

interface DexContextProviderI {
  displayGuidelines: boolean
  setDisplayGuidelines: (flag: boolean) => Promise<void>
}

const DexContextProvider = createContext<DexContextProviderI>(undefined as any)

export function useDexProvider (): DexContextProviderI {
  return useContext(DexContextProvider)
}

export function DexProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  const [displayGuidelines, setDisplayGuidelines] = useState(true)

  useEffect(() => {
    DisplayDexGuidelinesPersistence.get()
    .then((shouldDisplayGuidelines: boolean) => {
      setDisplayGuidelines(shouldDisplayGuidelines)
    })
    .catch((err) => Logging.error(err))
  }, [])

  const context: DexContextProviderI = {
    displayGuidelines: displayGuidelines,
    async setDisplayGuidelines (flag: boolean): Promise<void> {
      await DisplayDexGuidelinesPersistence.set(flag)
      setDisplayGuidelines(flag)
    }
  }

  return (
    <DexContextProvider.Provider value={context}>
      {props.children}
    </DexContextProvider.Provider>
  )
}
