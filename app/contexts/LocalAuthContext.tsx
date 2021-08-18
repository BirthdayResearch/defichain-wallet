import * as LocalAuthentication from 'expo-local-authentication'
import { AuthenticationType, SecurityLevel, LocalAuthenticationOptions } from 'expo-local-authentication'
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Logging } from '../api'
import { useWalletPersistenceContext } from './WalletPersistenceContext'
import { BiometricProtectedPasscode } from '../api/wallet/biometric_protected_passcode'
import { PrivacyLockPersistence } from '../api/wallet/privacy_lock'

interface LocalAuthContext {
  // user's hardware condition, external
  fetchHardwareStatus: () => void // not likely needed, in case user change device's security setting
  hasHardware: boolean
  hardwareSecurityLevel: SecurityLevel
  supportedTypes: AuthenticationType[]
  isDeviceProtected: boolean

  // API
  isWalletEncrypted: boolean
  isEnrolled: boolean
  canEnroll: boolean
  isPrivacyLock: boolean
  enrollBiometric: (passcode: string, options?: LocalAuthenticationOptions) => Promise<void>
  disenrollBiometric: (options?: LocalAuthenticationOptions) => Promise<void>
  privacyLock: (options?: LocalAuthenticationOptions) => Promise<void>
  enablePrivacyLock: (options?: LocalAuthenticationOptions) => Promise<void>
  disablePrivacyLock: (options?: LocalAuthenticationOptions) => Promise<void>
  togglePrivacyLock: (options?: LocalAuthenticationOptions) => Promise<void>
  authenticate: (options?: LocalAuthenticationOptions) => Promise<string> // return passcode
}

const localAuthContext = createContext<LocalAuthContext>(undefined as any)

export function useLocalAuthContext (): LocalAuthContext {
  return useContext(localAuthContext)
}

export function LocalAuthContextProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  const { wallets, isEncrypted } = useWalletPersistenceContext()

  // do not put default value, use as flag (init) indicate hardware check complete
  const [hasHardware, setHasHardware] = useState<boolean>()
  const [securityLevel, setSecurityLevel] = useState<SecurityLevel>(SecurityLevel.NONE)
  const [biometricHardwares, setBiometricHardwares] = useState<AuthenticationType[]>([])
  const [isDeviceProtected, setIsDeviceProtected] = useState<boolean>(false)

  // do not put default value, use as flag (init) indicate checked value from persistence layer
  const [isEnrolled, setIsEnrolled] = useState<boolean>()

  const [isLoaded, setIsLoaded] = useState(false)
  const [canEnroll, setCanEnroll] = useState(false)

  // do not put default value, use as flag (init) indicate checked value from persistence layer
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
  }, [])

  const disablePrivacyLock = useCallback(async (options?: LocalAuthenticationOptions) => {
    if (!(isPrivacyLock as boolean)) return
    await _authenticate(options)
    await PrivacyLockPersistence.set(false)
    setIsPrivacyLock(false)
  }, [])

  const enrollBiometric = useCallback(async (verifiedPasscode: string, options?: LocalAuthenticationOptions) => {
    if (!canEnroll) return // precaution, not expecting to reach here
    await _authenticate(options)
    await BiometricProtectedPasscode.set(verifiedPasscode)
    setIsEnrolled(true)
    await enablePrivacyLock() // default behavior, privacy lock inherit behavior, can be disabled individually
  }, [canEnroll])

  const disenrollBiometric = useCallback(async (bypass: boolean, options?: LocalAuthenticationOptions) => {
    if (!canEnroll) return // precaution, not expecting to reach here
    if (!bypass) await _authenticate(options)
    await BiometricProtectedPasscode.clear()
    setIsEnrolled(false)
    await disablePrivacyLock()// default behavior, privacy lock inherit behavior, can be enabled individually
  }, [canEnroll])

  useEffect(fetchHardwareStatus, [])
  useEffect(() => {
    BiometricProtectedPasscode.isEnrolled()
      .then(enrolled => setIsEnrolled(enrolled))
      .catch(error => {
        Logging.error(error)
        setIsEnrolled(false)
      })
  }, [/* only load from persistence layer once */])

  useEffect(() => {
    PrivacyLockPersistence.isEnabled()
      .then(enabled => setIsPrivacyLock(enabled))
      .catch(error => {
        Logging.error(error)
        setIsPrivacyLock(false)
      })
  }, [/* only load from persistence layer once */])

  useEffect(() => {
    if (wallets.length === 0) {
      disenrollBiometric(true)
        .catch(error => Logging.error(error))
    }
  }, [wallets])

  useEffect(() => {
    if (hasHardware !== undefined && isEnrolled !== undefined && isPrivacyLock !== undefined) {
      setCanEnroll(isEncrypted && isDeviceProtected)
      setIsLoaded(true) // init complete
    }
  }, [isEncrypted, hasHardware, isDeviceProtected, isPrivacyLock])

  if (!isLoaded) {
    return null
  }

  const context: LocalAuthContext = {
    fetchHardwareStatus,
    hasHardware: hasHardware as boolean,
    hardwareSecurityLevel: securityLevel,
    supportedTypes: biometricHardwares,
    isDeviceProtected,

    isWalletEncrypted: isEncrypted,
    isEnrolled: isEnrolled as boolean,
    canEnroll,
    isPrivacyLock: isPrivacyLock as boolean,
    enrollBiometric,
    disenrollBiometric: async (options?: LocalAuthenticationOptions) => {
      return await disenrollBiometric(false, options)
    },
    privacyLock: async (options) => {
      if (!(hasHardware as boolean) || !(isEnrolled as boolean)) return
      await _authenticate(options)
    },
    enablePrivacyLock,
    disablePrivacyLock,
    togglePrivacyLock: async (options) => {
      if (isPrivacyLock as boolean) return await disablePrivacyLock(options)
      return await enablePrivacyLock(options)
    },
    authenticate: async (options) => {
      if (!(isEnrolled as boolean)) {
        throw new Error('No biometric authentication enrolled')
      }
      await _authenticate(options)
      return (await BiometricProtectedPasscode.get()) as string
    }
  }

  return (
    <localAuthContext.Provider value={context}>
      {props.children}
    </localAuthContext.Provider>
  )
}
