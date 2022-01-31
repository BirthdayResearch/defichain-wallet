import { NextApiRequest, NextApiResponse } from 'next'
import { AnnouncementData } from '@shared-types/website'
import Cors from 'cors'
import { runMiddleware } from '../../../utils/middleware'

export const cors = Cors({
  methods: ['GET', 'HEAD']
})

export default async function handle (req: NextApiRequest, res: NextApiResponse<AnnouncementData[]>): Promise<void> {
  await runMiddleware(req, res, cors)
  res.json([{
    lang: {
      en: 'Update to the latest app version to access Auctions.',
      de: 'Aktualisiere auf die neueste App-Version, um Zugriff auf Auktionen zu bekommen.',
      'zh-Hans': '请即更新至最新应用程式版本以体验拍卖功能',
      'zh-Hant': '請即更新至最新應用程式版本以體驗拍賣功能',
      fr: 'Passez à la dernière version de l\'application pour accéder aux enchères.'
    },
    version: '<=1.0.0',
    id: '0',
    url: {
      ios: 'https://apps.apple.com/us/app/defichain-wallet/id1572472820',
      android: 'https://play.google.com/store/apps/details?id=com.defichain.app',
      web: '',
      windows: '',
      macos: ''
    }
  }, {
    lang: {
      en: '4 new dTokens (dAMZN, dNVDA, dCOIN and dEEM) are live on the DEX!',
      de: '4 neue dToken (dAMZN, dNVDA, dCOIN und dEEM) sind jetzt auf der DEX verfügbar!',
      'zh-Hans': '4 个新的去中心化资产代币（dAMZN、dNVDA、dCOIN 和 dEEM）在DEX 上上线！',
      'zh-Hant': '4 個新的去中心化資產代幣（dAMZN、dNVDA、dCOIN 和 dEEM）在DEX 上上線！',
      fr: '4 nouveaux dTokens (dAMZN, dNVDA, dCOIN et dEEM) sont en ligne sur le DEX !'
    },
    version: '>=1.1.0',
    id: '1'
  }])
}
