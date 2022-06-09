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
      en: 'There is a display issue where dAMZN-related values are incorrectly displayed. Funds are safe on the blockchain.',
      de: 'Es gibt ein Anzeigeproblem, bei dem dAMZN-bezogene Werte falsch angezeigt werden. Guthaben auf der Blockchain sind sicher.',
      'zh-Hans': '目前 dAMZN 相关值显示出现不正确的问题。请放心资产在区块链上是安全的。',
      'zh-Hant': '目前 dAMZN 相關值顯示出現不正確等問題。 請放心資產在區塊鏈上是安全的。',
      fr: 'Il y a un problème d\'affichage où les valeurs liées à dAMZN sont affichées de manière incorrecte. Les fonds sont en sécurité sur la blockchain.',
      es: 'Hay un problema de visualización donde los valores relacionados con dAMZN se muestran incorrectamente. Los fondos están seguros en la blockchain.',
      it: 'There is a display issue where dAMZN-related values are incorrectly displayed. Funds are safe on the blockchain.'
    },
    version: '>=1.0.0',
    id: '9',
    type: 'OTHER_ANNOUNCEMENT'
  }])
}
