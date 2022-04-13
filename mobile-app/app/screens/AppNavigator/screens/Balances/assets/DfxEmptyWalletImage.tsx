import { Image, StyleSheet } from 'react-native'
import ImageEmptyWallet from '@assets/images/EmptyWallet.png'

export function DfxEmptyWalletImage (): JSX.Element {
    const styles = StyleSheet.create({
        image: {
          height: '120px',
          resizeMode: 'contain',
          width: '120px'
        }
      })

    return (
      <Image style={styles.image} source={ImageEmptyWallet} />
    )
}
