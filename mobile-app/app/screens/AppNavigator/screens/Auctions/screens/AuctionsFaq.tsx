import { ThemedScrollViewV2, ThemedTextV2 } from "@components/themed";
import {
  AccordionContent,
  WalletAccordionV2,
} from "@components/WalletAccordionV2";
import { tailwind } from "@tailwind";
import { translate } from "@translations";

export function AuctionsFaq(): JSX.Element {
  const faqContent: AccordionContent[] = [
    {
      title: translate(
        "components/AuctionsFaq",
        "How do I know the status of my bid after an auction ends?"
      ),
      content: [
        {
          text: translate(
            "components/AuctionsFaq",
            "For successful bidders, bid amount will be deducted, and rewards will be automatically reflect under the Portfolio page."
          ),
          type: "paragraph",
        },
        {
          text: translate(
            "components/AuctionsFaq",
            "For unsuccessful bidders, the bidding amount will be returned automatically to your wallet once you have been outbid by another user."
          ),
          type: "paragraph",
        },
      ],
    },
    {
      title: translate(
        "components/AuctionsFaq",
        "How is the minimum starting bid determined?"
      ),
      content: [
        {
          text: translate(
            "components/AuctionsFaq",
            "The minimum starting bid is 105% of the batch's outstanding loan value. The additional 5% is included to cover the liquidation penalty, which is incurred upon vault liquidation."
          ),
          type: "paragraph",
        },
      ],
    },
    {
      title: translate(
        "components/AuctionsFaq",
        "How is the minimum next bid determined?"
      ),
      content: [
        {
          text: translate(
            "components/AuctionsFaq",
            "The minimum next bid is 1% above the previous bid price."
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
      testID="auctions_faq"
    >
      <ThemedTextV2 style={tailwind("text-base font-normal-v2 px-5")}>
        {translate(
          "components/AuctionsFaq",
          "Auction is an activity where users bid on the collateral in liquidated vaults to recover the vaults outstanding loans. Liquidation occurs when a vault's collateralization ratio falls below its minimum requirement, upon which the vault collateral will be split into batches of $10,000 USD for auction."
        )}
      </ThemedTextV2>

      <WalletAccordionV2
        testID="auctions_faq_accordion"
        title={translate(
          "components/AuctionsFaq",
          "FREQUENTLY ASKED QUESTIONS"
        )}
        content={faqContent}
      />
    </ThemedScrollViewV2>
  );
}
