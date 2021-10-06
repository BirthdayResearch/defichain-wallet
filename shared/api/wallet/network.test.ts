import { EnvironmentNetwork } from '@environment'
import { getBip32Option } from './network'

it('should resolve bip32 option for MainNet', () => {
  const bip32Options = getBip32Option(EnvironmentNetwork.MainNet)
  expect(bip32Options).toMatchSnapshot()
})

it('should resolve bip32 option for TestNet', () => {
  const bip32Options = getBip32Option(EnvironmentNetwork.TestNet)
  expect(bip32Options).toMatchSnapshot()
})

it('should resolve bip32 option for LocalPlayground', () => {
  const bip32Options = getBip32Option(EnvironmentNetwork.LocalPlayground)
  expect(bip32Options).toMatchSnapshot()
})

it('should resolve bip32 option for RemotePlayground', () => {
  const bip32Options = getBip32Option(EnvironmentNetwork.RemotePlayground)
  expect(bip32Options).toMatchSnapshot()
})
