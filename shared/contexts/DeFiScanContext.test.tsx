import { EnvironmentNetwork } from '@environment'
import { getTxURLByNetwork, getURLByNetwork, DeFiScanProvider, useDeFiScanContext } from './DeFiScanContext'
import { Text, View } from 'react-native'
import { render } from '@testing-library/react-native'

jest.mock('@shared-contexts/NetworkContext')
describe('DeFiScanContext test', () => {
  const baseDefiScanUrl = 'https://defiscan.live'

  it('should match the expected txn redirect url', () => {
    const txnId = 'dummyTransactionIdForTesting'
    const rawId = 'dummyRawTransactionIdForTesting'
    const expectedTxnUrl = `${baseDefiScanUrl}/transactions/${txnId}`
    const txnUrl = getTxURLByNetwork(EnvironmentNetwork.MainNet, txnId, '')
    const rawTxnUrl = getTxURLByNetwork(EnvironmentNetwork.MainNet, txnId, rawId)
    expect(txnUrl).toBe(expectedTxnUrl)
    expect(rawTxnUrl).toBe(`${expectedTxnUrl}?rawtx=${rawId}`)
  })

  it('should match the expected URL By Network', () => {
    const expectedUrl = `${baseDefiScanUrl}/blocks/1`
    const url = getURLByNetwork('blocks', EnvironmentNetwork.MainNet, '1')
    expect(url).toBe(expectedUrl)
  })
})

describe('DeFi Scan Context test', () => {
  it('should match snapshot', () => {
    function DeFiScanProviderComponent (): JSX.Element {
      const { getTransactionUrl, getBlocksUrl, getTokenUrl, getAddressUrl, getVaultsUrl, getAuctionsUrl } = useDeFiScanContext()
      const transactionUrl = getTransactionUrl('txnId')
      const blocksUrl = getBlocksUrl(1)
      const tokenUrl = getTokenUrl('0')
      const addressUrl = getAddressUrl('address')
      const vaultsUrl = getVaultsUrl('vaultId')
      const auctionsUrl = getAuctionsUrl('vaultId', 2)
      return (
        <View>
          <Text>{transactionUrl}</Text>
          <Text>{blocksUrl}</Text>
          <Text>{tokenUrl}</Text>
          <Text>{addressUrl}</Text>
          <Text>{vaultsUrl}</Text>
          <Text>{auctionsUrl}</Text>
        </View>
      )
    }

    const rendered = render(
      <DeFiScanProvider>
        <DeFiScanProviderComponent />
      </DeFiScanProvider>
    )

    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
