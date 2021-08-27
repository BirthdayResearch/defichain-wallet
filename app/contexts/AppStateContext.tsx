import React, { createContext, useCallback, useContext, useEffect, useRef } from 'react'
import { AppState, AppStateStatus } from 'react-native'

export type SimplifiedAppStateStatus = 'active' | 'background'
export type AppStateListener = (status: SimplifiedAppStateStatus) => void

export interface AppStateContext {
  addListener: (listener: AppStateListener) => number
  removeListener: (id: number) => void
}

const appStateContext = createContext<AppStateContext>(undefined as any)

export function useAppStateContext (): AppStateContext {
  return useContext(appStateContext)
}

export function AppStateContextProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  // DO NOT use `useState`, these are meant for appstate monitoring
  // re-render side effect is undesireable
  const listenerRef = useRef<{ [key: number]: AppStateListener }>({})
  const prevState = useRef<AppStateStatus>('background') // first mount aka default = come back from background

  // all useCallback / useEffect in this context provider MUST have ZERO dependencies, to remain predictable
  const emit = useCallback((nextState: SimplifiedAppStateStatus) => {
    prevState.current = nextState // simplify iOS lifecyle, skipping `inactive` as transition state
    if (listenerRef.current !== null) {
      Object.values(listenerRef.current).forEach(l => l(nextState))
    }
  }, [])

  const appStateHandler = useCallback((nextState: AppStateStatus) => {
    if (nextState === 'background' || nextState === 'inactive') {
      if (prevState.current === 'active') {
        prevState.current = 'background'
        emit('background')
      }
    } else if (nextState === 'active') {
      if (prevState.current === 'background') {
        prevState.current = 'active'
        emit('active')
      }
    }
  }, [])

  useEffect(() => {
    AppState.addEventListener('change', appStateHandler)
    return () => AppState.removeEventListener('change', appStateHandler)
  }, [])

  const context: AppStateContext = {
    addListener: l => {
      const existing = Object.keys(listenerRef.current)
      const id = getNewSerialNumber(existing.map(s => Number(s)))
      listenerRef.current[id] = l
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
    <appStateContext.Provider value={context}>
      {props.children}
    </appStateContext.Provider>
  )
}

function getNewSerialNumber (existing: number[]): number {
  let i = 0
  while (existing.includes(i)) i++
  return i
}
