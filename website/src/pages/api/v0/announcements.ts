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
        en: "Fort Canning Epilogue is now live! All new, and existing vaults with DUSD loans and DUSD collateral are now required to maintain at least 50% of collateral in DFI. DUSD collateral factor has also increased to 1.2.",
        de: "Fort Canning Epilogue ist jetzt live! Alle neuen und bestehenden Vaults mit DUSD-Darlehen und DUSD-Sicherheiten müssen nun mindestens 50% der Sicherheiten in DFI halten. Der Besicherungswert von DUSD wurde außerdem um Faktor 1,2 erhöht.",
        "zh-Hans":
          "Fort Canning Epilogue is now live! All new, and existing vaults with DUSD loans and DUSD collateral are now required to maintain at least 50% of collateral in DFI. DUSD collateral factor has also increased to 1.2.",
        "zh-Hant":
          "Fort Canning Epilogue is now live! All new, and existing vaults with DUSD loans and DUSD collateral are now required to maintain at least 50% of collateral in DFI. DUSD collateral factor has also increased to 1.2.",
        fr: "Fort Canning Epilogue est maintenant en ligne ! Tous les nouveaux vaults, et les vaults existants avec des prêts en DUSD et des garanties en DUSD sont maintenant tenus de maintenir au moins 50% des garanties en DFI. Le facteur de garantie DUSD est également passé à 1,2.",
        es: "Fort Canning Epilogue is now live! All new, and existing vaults with DUSD loans and DUSD collateral are now required to maintain at least 50% of collateral in DFI. DUSD collateral factor has also increased to 1.2.",
        it: "Fort Canning Epilogue is now live! All new, and existing vaults with DUSD loans and DUSD collateral are now required to maintain at least 50% of collateral in DFI. DUSD collateral factor has also increased to 1.2.",
      },
      version: ">=1.61.1",
      type: "OTHER_ANNOUNCEMENT",
      id: "16",
      url: {
        ios: "https://blog.defichain.com/new-rules-guide-decentralized-loans/",
        android:
          "https://blog.defichain.com/new-rules-guide-decentralized-loans/",
        web: "https://blog.defichain.com/new-rules-guide-decentralized-loans/",
        windows:
          "https://blog.defichain.com/new-rules-guide-decentralized-loans/",
        macos:
          "https://blog.defichain.com/new-rules-guide-decentralized-loans/",
      },
    },
  ]);
}
