import {
  ThemedIcon,
  ThemedScrollViewV2,
  ThemedSectionTitleV2,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import { translate } from "@translations";
import { tailwind } from "@tailwind";
import { useState } from "react";
import { View } from "react-native";
import { ButtonV2 } from "@components/ButtonV2";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { PortfolioParamList } from "@screens/AppNavigator/screens/Portfolio/PortfolioNavigator";
import { openURL } from "@api/linking";

export function OCGProposalsScreen(): JSX.Element {
  const navigation = useNavigation<NavigationProp<PortfolioParamList>>();
  const [selectedProposal, setSelectedProposal] = useState<OCGProposalType>(
    OCGProposalType.CFP
  );
  const itemList = [
    {
      id: OCGProposalType.CFP,
      title: translate(
        "screens/OCGProposalsScreen",
        "Community Funding Proposal"
      ),
      description: translate(
        "screens/OCGProposalsScreen",
        "Proposal to build on top of the DeFiChain blockchain, and funded by the Community Development Fund."
      ),
    },
    {
      id: OCGProposalType.DFIP,
      title: translate(
        "screens/OCGProposalsScreen",
        "DeFiChain Improvement Proposal"
      ),
      description: translate(
        "screens/OCGProposalsScreen",
        "Proposal to improve the key function(s) on DeFiChain."
      ),
    },
  ];

  function onContinue() {
    const screen =
      selectedProposal === OCGProposalType.CFP
        ? "CFPDetailScreen"
        : "DFIPDetailScreen";
    navigation.navigate(screen, {
      proposalType: selectedProposal,
    });
  }

  return (
    <ThemedScrollViewV2
      contentContainerStyle={tailwind("py-8 px-5 flex-grow justify-between")}
    >
      <View>
        {/* <AnnouncementBannerV2 */}
        {/*  announcement={{ */}
        {/*    content: translate( */}
        {/*      "screens/OCGProposalsScreen", */}
        {/*      "An active discussion on Github is required in creating a proposal. Click here if you haven’t created one yet." */}
        {/*    ), */}
        {/*    url: "https://github.com/DeFiCh/dfips", */}
        {/*    type: "OUTAGE", */}
        {/*  }} */}
        {/*  testID="ocg_proposal_banner" */}
        {/* /> */}
        <DiscussionBanner />
        <ThemedSectionTitleV2
          text={translate("screens/OCGProposalsScreen", "PROPOSAL TYPE")}
        />
        <ThemedViewV2
          style={tailwind("flex rounded-lg-v2")}
          light={tailwind("bg-mono-light-v2-00")}
          dark={tailwind("bg-mono-dark-v2-00")}
        >
          {itemList.map((item, index) => (
            <ProposalsItem
              key={item.id}
              id={item.id}
              title={item.title}
              description={item.description}
              showBottomBorder={index < itemList.length - 1}
              isSelected={item.id === selectedProposal}
              onSelected={() => setSelectedProposal(item.id)}
            />
          ))}
        </ThemedViewV2>
      </View>
      <ButtonV2
        label={translate("screens/OCGProposalsScreen", "Continue")}
        styleProps="mt-5 mx-7"
        testID="proposal_continue_button"
        onPress={onContinue}
      />
    </ThemedScrollViewV2>
  );
}

function DiscussionBanner(): JSX.Element {
  const githubLink = "https://github.com/DeFiCh/dfips/issues";
  const redditLink = "https://www.reddit.com/r/defiblockchain/";
  return (
    <ThemedViewV2
      style={tailwind("rounded-xl-v2 border-0.5 px-5 py-4")}
      dark={tailwind("border-mono-dark-v2-900")}
      light={tailwind("border-mono-light-v2-900")}
    >
      <ThemedTextV2 style={tailwind("font-normal-v2 text-xs pb-4")}>
        {translate(
          "screens/OCGProposalsScreen",
          "An active discussion on GitHub or Reddit is encouraged before creating a proposal."
        )}
      </ThemedTextV2>
      <View style={tailwind("flex-row items-center")}>
        <ThemedTouchableOpacityV2
          style={tailwind("flex-row items-center")}
          onPress={async () => await openURL(githubLink)}
        >
          <ThemedIcon
            dark={tailwind("text-mono-dark-v2-900")}
            light={tailwind("text-mono-light-v2-900")}
            iconType="MaterialCommunityIcons"
            name="github"
            size={20}
          />
          <ThemedTextV2 style={tailwind("font-normal-v2 text-xs pl-2")}>
            {translate("screens/OCGProposalsScreen", "GitHub")}
          </ThemedTextV2>
        </ThemedTouchableOpacityV2>
        <ThemedTouchableOpacityV2
          style={tailwind("flex-row items-center ml-6")}
          onPress={async () => await openURL(redditLink)}
        >
          <ThemedIcon
            dark={tailwind("text-mono-dark-v2-900")}
            light={tailwind("text-mono-light-v2-900")}
            iconType="MaterialCommunityIcons"
            name="reddit"
            size={20}
          />
          <ThemedTextV2 style={tailwind("font-normal-v2 text-xs pl-2")}>
            {translate("screens/OCGProposalsScreen", "Reddit")}
          </ThemedTextV2>
        </ThemedTouchableOpacityV2>
      </View>
    </ThemedViewV2>
  );
}

function ProposalsItem({
  id,
  title,
  description,
  showBottomBorder = false,
  isSelected = false,
  onSelected,
}: {
  id: string;
  title: string;
  description: string;
  showBottomBorder: boolean;
  isSelected: boolean;
  onSelected: () => void;
}): JSX.Element {
  return (
    <ThemedTouchableOpacityV2
      style={tailwind("flex flex-row mx-5 py-5.5", {
        "border-b-0.5": showBottomBorder,
      })}
      onPress={onSelected}
      testID={`${id}_button`}
    >
      <View style={tailwind("flex-1 flex-col pr-4")}>
        <ThemedTextV2
          style={tailwind("font-semibold-v2 text-sm")}
          testID={`${id}_title`}
        >
          {title}
        </ThemedTextV2>
        <ThemedTextV2
          style={tailwind("font-normal-v2 text-sm mt-1")}
          light={tailwind("text-mono-light-v2-700")}
          dark={tailwind("text-mono-dark-v2-700")}
          testID={`${id}_description`}
        >
          {description}
        </ThemedTextV2>
      </View>
      <ThemedIcon
        style={tailwind("mt-2.5")}
        iconType="MaterialIcons"
        light={tailwind("text-mono-light-v2-700", {
          "text-green-v2": isSelected,
        })}
        dark={tailwind("text-mono-dark-v2-700", {
          "text-green-v2": isSelected,
        })}
        name={isSelected ? "check-circle" : "radio-button-unchecked"}
        size={24}
      />
    </ThemedTouchableOpacityV2>
  );
}

export enum OCGProposalType {
  CFP = "CFP",
  DFIP = "DFIP",
}
