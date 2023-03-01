import { ThemedScrollViewV2, ThemedTextV2 } from "@components/themed";
import {
  AccordionContent,
  WalletAccordionV2,
} from "@components/WalletAccordionV2";
import { tailwind } from "@tailwind";
import { translate } from "@translations";

export function CfpDfipProposalsFaq(): JSX.Element {
  const faqContent: AccordionContent[] = [
    {
      title: translate(
        "components/CfpDfipProposalsFaq",
        "What is the difference between a DFIP and CFP?"
      ),
      content: [
        {
          text: translate(
            "components/CfpDfipProposalsFaq",
            "DeFiChain Improvement proposal (DFIP) aims to improve the key function(s) on DeFiChain.\nCommunity Funding Proposal (CFP) are community projects that build on top of DeFiChain. All approved CFPs are funded by the Community Development fund."
          ),
          type: "paragraph",
        },
      ],
    },
    {
      title: translate(
        "components/CfpDfipProposalsFaq",
        "How are proposal fees calculated?"
      ),
      content: [
        {
          text: translate(
            "components/CfpDfipProposalsFaq",
            "Proposal fees differ between DFIPs and CFPs. The cost of a DFIP proposal (vote of confidence) will be 50 DFI. Subsequently, a CFP proposal will cost 1% of the requested amount (DFI) or 10 DFI, whichever is larger. Proposal fee are automatically calculated and shown in the confirmation page."
          ),
          type: "paragraph",
        },
      ],
    },
    {
      title: translate(
        "components/CfpDfipProposalsFaq",
        "Where can I find more details for all submitted proposals?"
      ),
      content: [
        {
          text: translate(
            "components/CfpDfipProposalsFaq",
            "You may find all on-chain proposals on DeFiScan, under Governance tab."
          ),
          type: "paragraph",
        },
      ],
    },
    {
      title: translate(
        "components/CfpDfipProposalsFaq",
        "Can I vote on proposals using Light Wallet?"
      ),
      content: [
        {
          text: translate(
            "components/CfpDfipProposalsFaq",
            "No, only proposal submissions can be done through Light Wallet. Currently, voting can only be submitted on chain using commands via CLI. Voting commands can be generated on DeFiScan via Governance tab > Proposal details > Submit vote.\nYou will need to own a full node wallet and at least one masternode to vote."
          ),
          type: "paragraph",
        },
      ],
    },
    {
      title: translate(
        "components/CfpDfipProposalsFaq",
        "Are there other ways to submit proposals?"
      ),
      content: [
        {
          text: translate(
            "components/CfpDfipProposalsFaq",
            "If you own a full node wallet, you may also choose to submit using commands via CLI. Commands can be generated on DeFiScan, under Governance tab > Submit proposal."
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
      testID="utxo_vs_token_faq"
    >
      <ThemedTextV2 style={tailwind("text-base font-normal-v2 px-5")}>
        {translate(
          "components/CfpDfipProposalsFaq",
          "Governance on DeFiChain is a system for managing verified community proposals. Proposals can now be submitted using the mobile Light Wallet."
        )}
      </ThemedTextV2>

      <WalletAccordionV2
        testID="loans_faq_accordion"
        activeSections={[0]}
        title={translate(
          "components/CfpDfipProposalsFaq",
          "FREQUENTLY ASKED QUESTIONS"
        )}
        content={faqContent}
      />
    </ThemedScrollViewV2>
  );
}
