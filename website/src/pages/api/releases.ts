import { NextApiRequest, NextApiResponse } from 'next'

interface Data {
  name: string
}

export default function handle (req: NextApiRequest, res: NextApiResponse<Data>): void {
  // TODO(wallet-team): https://nextjs.org/docs/api-routes/introduction
  res.status(200).json({ name: 'John Doe' })
}
