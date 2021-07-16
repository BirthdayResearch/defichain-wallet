import * as Updates from 'expo-updates'

/**
 * Network supported in this environment
 */
export enum EnvironmentNetwork {
  LocalPlayground = 'Local Playground',
  RemotePlayground = 'Remote Playground',
  MainNet = 'MainNet',
  TestNet = 'TestNet'
}

export enum EnvironmentName {
  Production = 'Production',
  Preview = 'Preview',
  Development = 'Development',
}

interface Environment {
  name: EnvironmentName
  debug: boolean
  networks: EnvironmentNetwork[]
}

export const environments: Record<EnvironmentName, Environment> = {
  Production: {
    name: EnvironmentName.Production,
    debug: false,
    networks: [
      EnvironmentNetwork.RemotePlayground,
      EnvironmentNetwork.TestNet,
      EnvironmentNetwork.MainNet
    ]
  },
  Preview: {
    name: EnvironmentName.Preview,
    debug: true,
    networks: [
      EnvironmentNetwork.RemotePlayground,
      EnvironmentNetwork.TestNet,
      EnvironmentNetwork.MainNet
    ]
  },
  Development: {
    name: EnvironmentName.Development,
    debug: true,
    networks: [
      EnvironmentNetwork.LocalPlayground,
      EnvironmentNetwork.RemotePlayground
    ]
  }
}

/**
 * @return Environment of current Wallet, checked via expo release channels
 */
export function getEnvironment (): Environment {
  const channel = Updates.releaseChannel

  if (channel === 'production') {
    return environments[EnvironmentName.Production]
  }

  if (channel.startsWith('pr-preview-') || channel === 'prerelease') {
    return environments[EnvironmentName.Preview]
  }

  return environments[EnvironmentName.Development]
}

/**
 * @param {EnvironmentNetwork} network to check if it is a playground network
 */
export function isPlayground (network: EnvironmentNetwork): boolean {
  return [
    EnvironmentNetwork.LocalPlayground,
    EnvironmentNetwork.RemotePlayground
  ].includes(network)
}
