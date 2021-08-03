import { EnvironmentNetwork } from "../../environment";
import { getBip32Option, getTxURLByNetwork } from "./network";

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

it('should return correct tx url for MainNet', () => {
	const txUrl = getTxURLByNetwork(EnvironmentNetwork.MainNet, '123')
	expect(txUrl).toMatchSnapshot()
})

it('should return correct tx url for TestNet', () => {
	const txUrl = getTxURLByNetwork(EnvironmentNetwork.TestNet, '123')
	expect(txUrl).toMatchSnapshot()
})

it('should return correct tx url for LocalPlayground', () => {
	const txUrl = getTxURLByNetwork(EnvironmentNetwork.LocalPlayground, '123')
	expect(txUrl).toMatchSnapshot()
})

it('should return correct tx url for RemotePlayground', () => {
	const txUrl = getTxURLByNetwork(EnvironmentNetwork.RemotePlayground, '123')
	expect(txUrl).toMatchSnapshot()
})
