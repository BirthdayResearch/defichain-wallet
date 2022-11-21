import { ThemedScrollViewV2, ThemedTextV2 } from "@components/themed";
import {
  AccordionContent,
  WalletAccordionV2,
} from "@components/WalletAccordionV2";
import { useStyles } from "@tailwind";
import { translate } from "@translations";

export function LiquidityMiningFaq(): JSX.Element {
  const { tailwind } = useStyles();
  const faqContent: AccordionContent[] = [
    {
      title: translate(
        "components/LiquidityMiningFaq",
        "How do I supply liquidity?"
      ),
      content: [
        {
          text: translate(
            "components/LiquidityMiningFaq",
            "After deciding which pool pair you would like to supply liquidity to, click ADD LIQUIDITY and enter the input amount for either of the tokens in the pair.\n\nOnce an amount is entered on one side of the pair, the app automatically balances the amount of the other side, based on the ratio of current liquidity in the pool."
          ),
          type: "paragraph",
        },
      ],
    },
    {
      title: translate(
        "components/LiquidityMiningFaq",
        "How do I send tokens from my DFI wallet?"
      ),
      content: [
        {
          text: translate(
            "components/LiquidityMiningFaq",
            "Tokens on DeFiChain can only be sent to DFI addresses only. This means that you should not send directly to an exchange or a third party platform that does not support DeFiChain.\n\nSimilarly, liquidity tokens can only be sent to another DFI wallet address."
          ),
          type: "paragraph",
        },
      ],
    },
    {
      title: translate(
        "components/LiquidityMiningFaq",
        "What are some exchanges and platforms I can send to?"
      ),
      content: [
        {
          text: translate(
            "components/LiquidityMiningFaq",
            "1. Kucoin\n2. Bittrex\n3. Transak\n4. Cake DeFi\n\nView more at DeFiChain.com"
          ),
          type: "paragraph",
        },
      ],
    },
    {
      title: translate(
        "components/LiquidityMiningFaq",
        "Can I send liquidity pool tokens to an exchange or another entity?"
      ),
      content: [
        {
          text: translate(
            "components/LiquidityMiningFaq",
            "Liquidity tokens can only be sent to another DFI wallet address, and not to an exchange of central entity."
          ),
          type: "paragraph",
        },
      ],
    },
    {
      title: translate(
        "components/LiquidityMiningFaq",
        "How do I receive tokens on my DFI wallet?"
      ),
      content: [
        {
          text: translate(
            "components/LiquidityMiningFaq",
            "You can receive DFI tokens into your wallet by sharing your address found in the Receive page, or by getting the sender to scan the QR code.\n\nNote that you will not be able to receive native tokens (e.g. BTC, ETH) directly into your wallet."
          ),
          type: "paragraph",
        },
      ],
    },
  ];

  return (
    <ThemedScrollViewV2
      contentContainerStyle={tailwind("pt-8 px-5 pb-16")}
      style={tailwind("flex-1")}
      testID="liquidity_mining_faq"
    >
      <ThemedTextV2 style={tailwind("text-base font-normal-v2 px-5")}>
        {translate(
          "components/LiquidityMiningFaq",
          "Liquidity mining is a DeFi mechanism in which participants supply cryptocurrencies into liquidity pools, and in turn, be rewarded with fees and token based on their share of the total pool liquidity."
        )}
      </ThemedTextV2>

      <WalletAccordionV2
        testID="recovery_words_faq_accordion"
        activeSections={[0]}
        title={translate(
          "components/LiquidityMiningFaq",
          "FREQUENTLY ASKED QUESTIONS"
        )}
        content={faqContent}
      />
    </ThemedScrollViewV2>
  );
}
