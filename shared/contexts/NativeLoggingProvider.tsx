import { Logging } from '@api'
import React, { createContext, useContext, PropsWithChildren } from 'react'

export interface NativeLoggingProps {
  error: (error: any) => void
  info: (message: string) => void
}

const NativeLoggingContext = createContext<NativeLoggingProps>({} as any)

/**
 * NativeLoggingContext Context wrapped within <NativeLoggingProvider>
 *
 * This context enables logging functionality across the app
 */

export function useLogger (): NativeLoggingProps {
  return useContext(NativeLoggingContext)
}

export function NativeLoggingProvider (props: PropsWithChildren<any>): JSX.Element | null {
  const context: NativeLoggingProps = Logging

  return (
    <NativeLoggingContext.Provider value={context}>
      {props.children}
    </NativeLoggingContext.Provider>
  )
}
