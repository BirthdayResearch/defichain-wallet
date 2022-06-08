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
      'zh-Hans': 'There is a display issue where dAMZN-related values are incorrectly displayed. Funds are safe on the blockchain.',
      'zh-Hant': 'There is a display issue where dAMZN-related values are incorrectly displayed. Funds are safe on the blockchain.',
      fr: 'Il y a un problème d\'affichage où les valeurs liées à dAMZN sont affichées de manière incorrecte. Les fonds sont en sécurité sur la blockchain.',
      es: 'There is a display issue where dAMZN-related values are incorrectly displayed. Funds are safe on the blockchain.',
      it: 'There is a display issue where dAMZN-related values are incorrectly displayed. Funds are safe on the blockchain.'
    },
    version: '>=1.12.3',
    id: '9',
    type: 'OTHER_ANNOUNCEMENT'
  }])
}
