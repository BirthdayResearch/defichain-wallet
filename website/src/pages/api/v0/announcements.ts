import { NextApiRequest, NextApiResponse } from "next";
import { AnnouncementData } from "@shared-types/website";
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
  res.json([
    {
      lang: {
        en: "There is currently a high DEX stabilization fee imposed on DUSD-DFI, DUSD-USDT, and DUSD-USDC swaps due to DFIP 2206-D and DFIP 2207-B.",
        de: "Auf DUSD-DFI-, DUSD-USDT- und DUSD-USDC-Tauschgeschäfte wird derzeit eine hohe DEX-Stabilisierungsgebühr aufgrund von DFIP 2206-D und DFIP 2207-B erhoben.",
        "zh-Hans":
          "There is currently a high DEX stabilization fee imposed on DUSD-DFI, DUSD-USDT, and DUSD-USDC swaps due to DFIP 2206-D and DFIP 2207-B.",
        "zh-Hant":
          "There is currently a high DEX stabilization fee imposed on DUSD-DFI, DUSD-USDT, and DUSD-USDC swaps due to DFIP 2206-D and DFIP 2207-B.",
        fr: "Il y a actuellement des frais de stabilisation DEX élevés imposés sur les échanges DUSD-DFI, DUSD-USDT, et DUSD-USDC en raison de DFIP 2206-D et DFIP 2207-B.",
        es: "There is currently a high DEX stabilization fee imposed on DUSD-DFI, DUSD-USDT, and DUSD-USDC swaps due to DFIP 2206-D and DFIP 2207-B.",
        it: "There is currently a high DEX stabilization fee imposed on DUSD-DFI, DUSD-USDT, and DUSD-USDC swaps due to DFIP 2206-D and DFIP 2207-B.",
      },
      version: ">=100.0.0",
      type: "SCAN",
      id: "12",
      url: {
        ios: "https://blog.defichain.com/dex-stabilization-fee/",
        android: "https://blog.defichain.com/dex-stabilization-fee/",
        web: "https://blog.defichain.com/dex-stabilization-fee/",
        windows: "https://blog.defichain.com/dex-stabilization-fee/",
        macos: "https://blog.defichain.com/dex-stabilization-fee/",
      },
    },
    {
      lang: {
        en: "Negative interest rate is in effect for DUSD loans due to DFIP-2208-A.",
        de: "Negative interest rate is in effect for DUSD loans due to DFIP-2208-A.",
        "zh-Hans":
          "Negative interest rate is in effect for DUSD loans due to DFIP-2208-A.",
        "zh-Hant":
          "Negative interest rate is in effect for DUSD loans due to DFIP-2208-A.",
        fr: "Negative interest rate is in effect for DUSD loans due to DFIP-2208-A.",
        es: "Negative interest rate is in effect for DUSD loans due to DFIP-2208-A.",
        it: "Negative interest rate is in effect for DUSD loans due to DFIP-2208-A.",
      },
      version: ">=1.61.1",
      type: "OUTAGE",
      id: "15",
      url: {
        ios: "https://github.com/DeFiCh/dfips/issues/195",
        android: "https://github.com/DeFiCh/dfips/issues/195",
        web: "https://github.com/DeFiCh/dfips/issues/195",
        windows: "https://github.com/DeFiCh/dfips/issues/195",
        macos: "https://github.com/DeFiCh/dfips/issues/195",
      },
    },
  ]);
}
