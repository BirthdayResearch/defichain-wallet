import { ThemedScrollViewV2, ThemedTextV2 } from "@components/themed";
import {
  AccordionContent,
  WalletAccordionV2,
} from "@components/WalletAccordionV2";
import { tailwind } from "@tailwind";
import { translate } from "@translations";

export function EvmFeatureFaq(): JSX.Element {
  const faqContent: AccordionContent[] = [
    {
      title: translate(
        "components/EvmFeatureFaq",
        "What tokens are supported between DVM and EVM bidirectionally?",
      ),
      content: [
        {
          text: translate(
            "components/EvmFeatureFaq",
            "All dTokens are accepted. dTokens consist of:\ndStocks (dTSLA, dGOOG.) + DFI\n\nFor the full list, you may refer to https://defiscan.live/tokens on any tokens under DAT category.",
          ),
          type: "paragraph",
        },
      ],
    },
    {
      title: translate(
        "components/EvmFeatureFaq",
        "How can I access the MetaChain layer from the Light Wallet?",
      ),
      content: [
        {
          text: translate(
            "components/EvmFeatureFaq",
            "Move your dTokens between native DeFiChain's native layer (DVM) and the MetaChain layer (EVM) bidirectionally.\n\nFor instance, transfer DFI/DUSD/dBTC or any other dToken from DVM to EVM and back, all directly within the Light Wallet.",
          ),
          type: "paragraph",
        },
      ],
    },
    {
      title: translate(
        "components/EvmFeatureFaq",
        "Why would I need to move dTokens from DVM to EVM?",
      ),
      content: [
        {
          text: translate(
            "components/EvmFeatureFaq",
            "Using the gateway allows you to move your dTokens from the Light Wallet to any EVM compatible wallet on the MetaChain layer (ex: MetaMask). This would allow you to interact with the constantly growing EVM ecosystem on MetaChain and the various projects on it.",
          ),
          type: "paragraph",
        },
      ],
    },
    {
      title: translate(
        "components/EvmFeatureFaq",
        "How can I move dTokens from DVM to EVM?",
      ),
      content: [
        {
          text: translate(
            "components/EvmFeatureFaq",
            'You can do it through either the "Convert" or "Send" functions on Light Wallet. The "Convert" option allows you to convert any dTokens on DVM to your own EVM address within the Light Wallet (and vice versa).\n\nYour seed phrase can also be used to import your Light Wallet EVM address into any external wallets which support a 24 words recovery phrase like MetaMask.\n\nThe "Send" option allows you to send dTokens from your DVM address to any EVM address on the MetaChain layer and vice versa. Note that you do not need to convert your dTokens before sending, this process does it automatically for you.',
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
      testID="evm_feature_faq"
    >
      <ThemedTextV2 style={tailwind("text-base font-normal-v2 px-5")}>
        {translate(
          "components/EvmFeatureFaq",
          "The MetaChain layer provides an EVM-compatible environment that allows developers familiar with Ethereum to build applications inside the DeFiChain ecosystem.",
        )}
      </ThemedTextV2>

      <WalletAccordionV2
        testID="evm_faq_accordion"
        activeSections={[0]}
        title={translate(
          "components/EvmFeatureFaq",
          "FREQUENTLY ASKED QUESTIONS",
        )}
        content={faqContent}
      />
    </ThemedScrollViewV2>
  );
}
