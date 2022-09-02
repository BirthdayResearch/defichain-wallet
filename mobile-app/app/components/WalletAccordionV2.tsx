import { useState } from "react";
import Accordion from "react-native-collapsible/Accordion";
import { tailwind } from "@tailwind";
import { View } from "react-native";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import {
  ThemedIcon,
  ThemedScrollViewV2,
  ThemedSectionTitleV2,
  ThemedTextV2,
  ThemedViewV2,
} from "./themed";

interface AccordionProps {
  testID?: string;
  title: string;
  content: AccordionContent[];
  activeSections?: number[] | string[];
}

export interface AccordionContent {
  title: string;
  content: Array<{
    text: string;
    type: "bullet" | "paragraph";
  }>;
}

export function WalletAccordionV2(props: AccordionProps): JSX.Element {
  const { isLight } = useThemeContext();
  const [activeSections, setActiveSections] = useState<number[] | string[]>(
    props.activeSections ?? []
  );
  const isLastContent = (index: number): boolean => {
    return index === props.content.length - 1;
  };

  return (
    <ThemedScrollViewV2 testID={props.testID}>
      <ThemedSectionTitleV2
        style={tailwind("mt-8 text-xs font-normal-v2 px-5")}
        text={props.title}
      />

      <Accordion
        containerStyle={[
          tailwind("rounded-lg mt-2 overflow-hidden"),
          isLight
            ? tailwind("bg-mono-light-v2-00")
            : tailwind("bg-mono-dark-v2-00"),
        ]}
        underlayColor="transparent"
        sections={props.content}
        renderHeader={(prop, index, isActive) => {
          return (
            <ThemedViewV2
              light={tailwind("border-mono-light-v2-300")}
              dark={tailwind("border-mono-dark-v2-300")}
              style={[
                tailwind("mx-5 py-4 flex-row items-start justify-between"),
                !isActive && !isLastContent(index) && tailwind("border-b"),
                isActive && tailwind("pb-1"),
              ]}
            >
              <ThemedTextV2
                style={tailwind([
                  "text-sm flex-1 font-normal-v2",
                  { "font-semibold-v2": isActive },
                ])}
                light={tailwind(
                  isActive ? "text-mono-light-v2-900" : "text-mono-light-v2-700"
                )}
                dark={tailwind(
                  isActive ? "text-mono-dark-v2-900" : "text-mono-dark-v2-700"
                )}
              >
                {prop.title}
              </ThemedTextV2>
              <ThemedIcon
                iconType="Feather"
                name={isActive ? "chevron-up" : "chevron-down"}
                size={24}
                light={tailwind("text-mono-light-v2-900")}
                dark={tailwind("text-mono-dark-v2-900")}
              />
            </ThemedViewV2>
          );
        }}
        renderContent={(prop, index, isActive) => {
          return (
            <ThemedViewV2
              style={[
                tailwind("mx-5 py-4"),
                isActive && !isLastContent(index) && tailwind("border-b"),
              ]}
              light={tailwind("border-mono-light-v2-300")}
              dark={tailwind("border-mono-dark-v2-300")}
            >
              {prop.content.map(({ text, type }) => (
                <View key={text} style={tailwind("flex-row justify-start")}>
                  {type === "bullet" && (
                    <ThemedTextV2
                      style={tailwind(
                        "w-1/12 text-center font-bold-v2 text-sm"
                      )}
                    >
                      {"\u2022"}
                    </ThemedTextV2>
                  )}
                  <ThemedTextV2
                    key={text}
                    style={tailwind("flex-1 text-sm font-normal-v2")}
                  >
                    {text}
                  </ThemedTextV2>
                </View>
              ))}
            </ThemedViewV2>
          );
        }}
        onChange={(activeSections) => {
          setActiveSections(activeSections);
        }}
        activeSections={activeSections}
      />
    </ThemedScrollViewV2>
  );
}
