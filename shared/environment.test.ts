import { EnvironmentName, EnvironmentNetwork, environments, getEnvironment, isPlayground } from '@environment'

describe('environments', () => {
  it('should match Production', () => {
    const env = environments.Production

    expect(env.name).toStrictEqual(EnvironmentName.Production)
    expect(env).toMatchSnapshot()
  })

  it('should match Preview', () => {
    const env = environments.Preview

    expect(env.name).toStrictEqual(EnvironmentName.Preview)
    expect(env).toMatchSnapshot()
  })

  it('should match Development', () => {
    const env = environments.Development

    expect(env.name).toStrictEqual(EnvironmentName.Development)
    expect(env).toMatchSnapshot()
  })
})

it('should match development for default', () => {
  const env = getEnvironment('development')
  expect(env.name).toStrictEqual(EnvironmentName.Development)
})

it('should match Remote Playground on Production environment', () => {
  const env = getEnvironment('production')
  expect(env.name).toStrictEqual(EnvironmentName.Production)
  // To be changed to MainNet on launch
  expect(env.networks[0]).toStrictEqual(EnvironmentNetwork.MainNet)
})

it('should match Remote Playground on prerelease environment', () => {
  const env = getEnvironment('prerelease')
  expect(env.name).toStrictEqual(EnvironmentName.Preview)
  expect(env.networks[0]).toStrictEqual(EnvironmentNetwork.RemotePlayground)
})

it('should check if isPlayground', () => {
  expect(isPlayground(EnvironmentNetwork.LocalPlayground)).toBe(true)
  expect(isPlayground(EnvironmentNetwork.RemotePlayground)).toBe(true)
  expect(isPlayground(EnvironmentNetwork.MainNet)).toBe(false)
  expect(isPlayground(EnvironmentNetwork.TestNet)).toBe(false)
})
