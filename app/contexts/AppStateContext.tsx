import React, { createContext, useCallback, useContext, useEffect, useRef } from 'react'
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
  // re-render side effect is undesireable
  const listenerRef = useRef<{ [key: number]: AppStateListener } | null>(null)
  const prevState = useRef<AppStateStatus>('active') // first mounted

  // all useCallback / useEffect in this context provider MUST have ZERO dependencies, to remain predictable
  const emit = useCallback((nextState: SimplifiedAppStateStatus) => {
    const listeners = Object.values(listenerRef.current ?? {})
    prevState.current = nextState
    listeners.forEach(l => l(nextState))
  }, [])

  const appStateHandler = useCallback((nextState: AppStateStatus) => {
    // detect state change
    if (nextState === 'background' || nextState === 'inactive') {
      if (prevState.current === 'active') {
        emit('background')
      }
    } else if (nextState === 'active') {
      if (prevState.current === 'background') {
        emit('active')
      }
    }
  }, [])

  useEffect(() => {
    const cb = (ns: AppStateStatus): void => {
      appStateHandler(ns)
    }
    AppState.addEventListener('change', cb)
    return () => AppState.removeEventListener('change', cb)
  }, [])

  const context: AppStateContextI = {
    addListener: l => {
      const existing = Object.keys(listenerRef)
      const id = getNewSerialNumber(existing.map(s => Number(s)))
      listenerRef.current = {
        ...(listenerRef.current ?? {}),
        [id]: l
      }
      return id
    },
    removeListener: (id: number) => {
      if (listenerRef.current === null) {
        return
      }
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
