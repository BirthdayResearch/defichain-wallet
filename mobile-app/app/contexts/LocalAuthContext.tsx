import * as LocalAuthentication from 'expo-local-authentication'
import { AuthenticationType, LocalAuthenticationOptions, SecurityLevel } from 'expo-local-authentication'
import { createContext, useContext, useEffect, useState } from 'react'
import * as React from 'react'
import { PrivacyLockPersistence } from '@api/wallet/privacy_lock'
import { Platform } from 'react-native'
import { useLogger } from '../../../shared/contexts/NativeLoggingProvider'

export interface PrivacyLockContextI {
  // user's hardware condition, external
  fetchHardwareStatus: () => void // not likely needed, in case user change device's security setting
  hasHardware: boolean
  hardwareSecurityLevel: SecurityLevel
  supportedTypes: AuthenticationType[]
  isDeviceProtected: boolean
  isAuthenticating: boolean
  setIsAuthenticating: (isAuthenticating: boolean) => void
  getAuthenticationNaming: () => string | undefined

  // API
  isEnabled: boolean
  prompt: (options?: LocalAuthenticationOptions) => Promise<void>
  setEnabled: (enabled: boolean, options?: LocalAuthenticationOptions) => Promise<void>
  togglePrivacyLock: (options?: LocalAuthenticationOptions) => Promise<void>
}

const PrivacyLockContext = createContext<PrivacyLockContextI>(undefined as any)

export function usePrivacyLockContext (): PrivacyLockContextI {
  return useContext(PrivacyLockContext)
}

export function PrivacyLockContextProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  const logger = useLogger()
  const [hasHardware, setHasHardware] = useState<boolean>(false)
  const [securityLevel, setSecurityLevel] = useState<SecurityLevel>(SecurityLevel.NONE)
  const [biometricHardwares, setBiometricHardwares] = useState<AuthenticationType[]>([])
  const [isDeviceProtected, setIsDeviceProtected] = useState<boolean>(false)
  const [isPrivacyLock, setIsPrivacyLock] = useState<boolean>()
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false)
  const [isLocalAuthLoaded, setIsLocalAuthLoaded] = useState<boolean>(false)
  const [isDevicePersistenceLoaded, setIsDevicePersistenceLoaded] = useState<boolean>(false)

  const fetchHardwareStatus = (): void => {
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
        setIsLocalAuthLoaded(true)
      })
      .catch(error => {
        logger.error(error)
        setHasHardware(false)
        setIsLocalAuthLoaded(true)
      })
  }

  useEffect(() => {
    fetchHardwareStatus()
    PrivacyLockPersistence.isEnabled()
      .then(enabled => setIsPrivacyLock(enabled))
      .catch(error => {
        logger.error(error)
        setIsPrivacyLock(false)
      })
      .finally(() => {
        setIsDevicePersistenceLoaded(true)
      })
  }, [/* only load from persistence layer once */])

  const context: PrivacyLockContextI = {
    fetchHardwareStatus,
    hasHardware,
    hardwareSecurityLevel: securityLevel,
    supportedTypes: biometricHardwares,
    isDeviceProtected,
    isEnabled: isPrivacyLock === true,
    isAuthenticating,
    setIsAuthenticating,
    prompt: async (options) => {
      if (!isDeviceProtected || !(isPrivacyLock !== undefined && isPrivacyLock)) {
        return
      }
      setIsAuthenticating(true)
      await _authenticate(options)
    },
    setEnabled: async (enabled, options) => {
      if (isPrivacyLock as boolean === enabled) {
        return
      }
      await _authenticate(options)
      await PrivacyLockPersistence.set(enabled)
      setIsPrivacyLock(enabled)
    },
    togglePrivacyLock: async () => {
      if (isPrivacyLock === undefined) {
        return
      }
      return await context.setEnabled(!isPrivacyLock)
    },
    getAuthenticationNaming: () => {
      if (Platform.OS === 'ios') {
        switch (securityLevel) {
          case SecurityLevel.SECRET:
            return 'device\'s lock'

          case SecurityLevel.BIOMETRIC:
            if (biometricHardwares.includes(AuthenticationType.FACIAL_RECOGNITION)) {
              return 'Face ID'
            } else if (biometricHardwares.includes(AuthenticationType.FINGERPRINT)) {
              return 'Touch ID'
            } else {
              // no-op for iris scanner(android-only)
            }
        }
      } else if (Platform.OS === 'android') {
        switch (securityLevel) {
          case SecurityLevel.SECRET:
            return 'device\'s lock'

          case SecurityLevel.BIOMETRIC:
            return 'biometric'
        }
      } else {
        // no-op: does not handle other devices
      }
    }
  }

  if (isPrivacyLock === undefined || !(isLocalAuthLoaded && isDevicePersistenceLoaded)) {
    return null
  }
  return (
    <PrivacyLockContext.Provider value={context}>
      {props.children}
    </PrivacyLockContext.Provider>
  )
}

async function _authenticate (options?: LocalAuthenticationOptions): Promise<void> {
  const result = await LocalAuthentication.authenticateAsync(options)
  if (!result.success) {
    throw new Error(result.error)
  }
}
