import * as LocalAuthentication from 'expo-local-authentication'
import { AuthenticationType, SecurityLevel, LocalAuthenticationOptions } from 'expo-local-authentication'
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Logging } from '../api'
import { PrivacyLockPersistence } from '../api/wallet/privacy_lock'

export interface LocalAuthContext {
  // user's hardware condition, external
  fetchHardwareStatus: () => void // not likely needed, in case user change device's security setting
  hasHardware: boolean
  hardwareSecurityLevel: SecurityLevel
  supportedTypes: AuthenticationType[]
  isDeviceProtected: boolean

  // API
  isPrivacyLock?: boolean
  privacyLock: (options?: LocalAuthenticationOptions) => Promise<void>
  enablePrivacyLock: (options?: LocalAuthenticationOptions) => Promise<void>
  disablePrivacyLock: (options?: LocalAuthenticationOptions) => Promise<void>
  togglePrivacyLock: (options?: LocalAuthenticationOptions) => Promise<void>
}

const localAuthContext = createContext<LocalAuthContext>(undefined as any)

export function useLocalAuthContext (): LocalAuthContext {
  return useContext(localAuthContext)
}

export function LocalAuthContextProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  const [hasHardware, setHasHardware] = useState<boolean>(false)
  const [securityLevel, setSecurityLevel] = useState<SecurityLevel>(SecurityLevel.NONE)
  const [biometricHardwares, setBiometricHardwares] = useState<AuthenticationType[]>([])
  const [isDeviceProtected, setIsDeviceProtected] = useState<boolean>(false)
  const [isPrivacyLock, setIsPrivacyLock] = useState<boolean>()

  const fetchHardwareStatus = useCallback(() => {
    LocalAuthentication.hasHardwareAsync()
      .then(async hasHardware => {
        if (!hasHardware) {
          setIsDeviceProtected(false)
        }

        const security = await LocalAuthentication.getEnrolledLevelAsync()
        setSecurityLevel(security)
        setBiometricHardwares(await LocalAuthentication.supportedAuthenticationTypesAsync())
        setIsDeviceProtected(security !== SecurityLevel.NONE)

        setHasHardware(hasHardware) // last, also used as flag indicated hardware check completed
      })
      .catch(error => {
        Logging.error(error)
        setHasHardware(false)
      })
  }, [])

  // native expo-local-authenticate
  const _authenticate = useCallback(async (options?: LocalAuthenticationOptions) => {
    const result = await LocalAuthentication.authenticateAsync(options)
    if (!result.success) {
      throw new Error(result.error)
    }
  }, [])

  const enablePrivacyLock = useCallback(async (options?: LocalAuthenticationOptions) => {
    if (isPrivacyLock as boolean) return
    await _authenticate(options)
    await PrivacyLockPersistence.set(true)
    setIsPrivacyLock(true)
  }, [isPrivacyLock])

  const disablePrivacyLock = useCallback(async (options?: LocalAuthenticationOptions) => {
    if (!(isPrivacyLock as boolean)) return
    await _authenticate(options)
    await PrivacyLockPersistence.set(false)
    setIsPrivacyLock(false)
  }, [isPrivacyLock])

  useEffect(fetchHardwareStatus, [])

  useEffect(() => {
    PrivacyLockPersistence.isEnabled()
      .then(enabled => setIsPrivacyLock(enabled))
      .catch(error => {
        Logging.error(error)
        setIsPrivacyLock(false)
      })
  }, [/* only load from persistence layer once */])

  const context: LocalAuthContext = {
    fetchHardwareStatus,
    hasHardware,
    hardwareSecurityLevel: securityLevel,
    supportedTypes: biometricHardwares,
    isDeviceProtected,
    isPrivacyLock,
    privacyLock: async (options) => {
      if (!hasHardware || !(isPrivacyLock !== undefined && isPrivacyLock)) return
      await _authenticate(options)
    },
    enablePrivacyLock,
    disablePrivacyLock,
    togglePrivacyLock: async (options) => {
      if (isPrivacyLock === true) return await disablePrivacyLock(options)
      return await enablePrivacyLock(options)
    }
  }

  return (
    <localAuthContext.Provider value={context}>
      {props.children}
    </localAuthContext.Provider>
  )
}
