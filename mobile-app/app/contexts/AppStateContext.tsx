import { createContext, useContext, useEffect, useRef } from 'react'
import * as React from 'react'
import { AppState, AppStateStatus } from 'react-native'

export type SimplifiedAppStateStatus = 'active' | 'background'
export type AppStateListener = (status: SimplifiedAppStateStatus) => void

export interface AppStateContextI {
  addListener: (listener: AppStateListener) => number
  removeListener: (id: number) => void
}

const AppStateContext = createContext<AppStateContextI>(undefined as any)

export function useAppStateContext (): AppStateContextI {
  return useContext(AppStateContext)
}

export function AppStateContextProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  // DO NOT use `useState`, these are meant for appstate monitoring
  // re-render side effect is undesirable
  const listenerRef = useRef<{ [key: number]: AppStateListener }>({})
  const prevState = useRef<AppStateStatus>('active') // first mounted

  const emit = (nextState: SimplifiedAppStateStatus): void => {
    const listeners = Object.values(listenerRef.current)
    prevState.current = nextState
    listeners.forEach(l => l(nextState))
  }

  useEffect(() => {
    const handler = (nextState: AppStateStatus): void => {
      if (prevState.current === 'active') {
        if (nextState === 'background' || nextState === 'inactive') {
          emit('background')
        }
      } else if (nextState === 'active') { // prev = background
        emit('active')
      }
    }
    AppState.addEventListener('change', handler)
    return () => AppState.removeEventListener('change', handler)
  }, [])

  const context: AppStateContextI = {
    addListener: l => {
      const existing = Object.keys(listenerRef)
      const id = getNewSerialNumber(existing.map(s => Number(s)))
      listenerRef.current = {
        ...listenerRef.current,
        [id]: l
      }
      return id
    },
    removeListener: (id: number) => {
      if (listenerRef.current[id] !== undefined) {
        // eslint-disable-next-line
        delete listenerRef.current[id]
      }
    }
  }

  return (
    <AppStateContext.Provider value={context}>
      {props.children}
    </AppStateContext.Provider>
  )
}

function getNewSerialNumber (existing: number[]): number {
  let i = 0
  while (existing.includes(i)) {
    i = Math.floor(Math.random() * 1000)
  }
  return i
}
