import { NextApiRequest, NextApiResponse } from "next";
import { AnnouncementData } from "@waveshq/wallet-core";
import Cors from "cors";
import { runMiddleware } from "../../../utils/middleware";

export const cors = Cors({
  methods: ["GET", "HEAD"],
});

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<AnnouncementData[]>
): Promise<void> {
  await runMiddleware(req, res, cors);
  res.json([]);
}
