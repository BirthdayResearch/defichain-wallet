import { Image, StyleSheet } from 'react-native'
import ImageEmptyWallet from '@assets/images/empty_wallet.png'

export function DfxEmptyWalletImage (): JSX.Element {
    const styles = StyleSheet.create({
        image: {
          height: 120,
          resizeMode: 'contain',
          width: 120
        }
      })

    return (
      <Image style={styles.image} source={ImageEmptyWallet} />
    )
}
