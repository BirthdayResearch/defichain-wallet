import {
  ThemedIcon,
  ThemedProps,
  ThemedText,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedView,
  ThemedViewV2,
} from "@components/themed";
import { tailwind } from "@tailwind";
import { useGetAnnouncementsQuery } from "@waveshq/walletkit-ui/dist/store";
import { AnnouncementData } from "@waveshq/walletkit-core";
import { satisfies } from "semver";
import { useLanguageContext } from "@shared-contexts/LanguageProvider";
import { openURL } from "@api/linking";
import { Platform, StyleProp, TouchableOpacity, ViewStyle } from "react-native";
import { nativeApplicationVersion } from "expo-application";
import { translate } from "@translations";
import { Text } from "@components";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useApiStatus } from "@hooks/useApiStatus";
import { IconProps } from "@expo/vector-icons/build/createIconSet";
import { useThemeContext } from "@waveshq/walletkit-ui";
import { useServiceProviderContext } from "@contexts/StoreServiceProvider";
import {
  blockChainIsDownContent,
  useDeFiChainStatus,
} from "../hooks/DeFiChainStatus";
import { useDisplayAnnouncement } from "../hooks/DisplayAnnouncement";

export function Announcements(): JSX.Element {
  const { data: announcements, isSuccess } = useGetAnnouncementsQuery({});

  const { language } = useLanguageContext();
  const { hiddenAnnouncements, hideAnnouncement } = useDisplayAnnouncement();

  const { blockchainStatusAnnouncement, oceanStatusAnnouncement } =
    useDeFiChainStatus();

  const { isCustomUrl } = useServiceProviderContext();

  const { isBlockchainDown } = useApiStatus();

  const customServiceProviderIssue: AnnouncementData[] = [
    {
      lang: {
        en: "We have detected issues with your custom endpoint that is affecting your connection. You are advised to check on the status of your custom endpoint provider",
        de: "Wir haben Probleme mit deinem benutzerdefinierten Endpunkt festgestellt, die deine Verbindung beeinträchtigen. Wir empfehlen, den Status deines benutzerdefinierten Endpunktanbieters zu überprüfen.",
        "zh-Hans":
          "我们侦测到您目前使用的自定义终端点会影响到您的连接问题。建议您与供应者检查其连接状态。 ",
        "zh-Hant":
          "我們偵測到您目前使用的自定義終端點會影響到您的連接問題。 建議您與供應者檢查其連接狀態。",
        fr: "Nous avons détecté des problèmes avec votre point de terminaison personnalisé qui affectent votre connexion. Nous vous conseillons de vérifier le statut de votre fournisseur de point d'accès personnalisé.",
        es: "We have detected issues with your custom endpoint that is affecting your connection. You are advised to check on the status of your custom endpoint provider",
        it: "We have detected issues with your custom endpoint that is affecting your connection. You are advised to check on the status of your custom endpoint provider",
      },
      version: "0.0.0",
      type: "EMERGENCY",
    },
  ];

  const [emergencyMsgContent, setEmergencyMsgContent] = useState<
    AnnouncementData[] | undefined
  >();

  const emergencyAnnouncement = findDisplayedAnnouncementForVersion(
    "0.0.0",
    language,
    hiddenAnnouncements,
    emergencyMsgContent
  );
  const blockchainIsDownAnnouncement = findDisplayedAnnouncementForVersion(
    "0.0.0",
    language,
    hiddenAnnouncements,
    blockchainStatusAnnouncement
  );
  const oceanIsDownAnnouncement = findDisplayedAnnouncementForVersion(
    "0.0.0",
    language,
    hiddenAnnouncements,
    oceanStatusAnnouncement
  );
  const announcement = findDisplayedAnnouncementForVersion(
    nativeApplicationVersion ?? "0.0.0",
    language,
    hiddenAnnouncements,
    announcements
  );

  /*
    Display priority:
    1. Emergencies - Custom Provider/Blockchain Issue
    2. Outages - Blockchain API
    3. Outages - Ocean API
    4. Other announcements
  */
  const announcementToDisplay: Announcement | undefined =
    emergencyAnnouncement ??
    blockchainIsDownAnnouncement ??
    oceanIsDownAnnouncement ??
    announcement;

  useEffect(() => {
    // To display warning message in Announcement banner when blockchain is down for > 45 mins
    if (isBlockchainDown && !isCustomUrl) {
      return setEmergencyMsgContent(blockChainIsDownContent);
    } else if (isBlockchainDown && isCustomUrl) {
      return setEmergencyMsgContent(customServiceProviderIssue);
    } else {
      return setEmergencyMsgContent(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBlockchainDown]);

  if (!isSuccess || announcementToDisplay === undefined) {
    return <></>;
  }

  return (
    <AnnouncementBannerV2
      announcement={announcementToDisplay}
      hideAnnouncement={hideAnnouncement}
      testID="announcements_banner"
      containerStyle={{ style: tailwind("mt-9 mx-5") }}
    />
  );
}

interface AnnouncementBannerProps {
  hideAnnouncement?: (id: string) => void;
  announcement: Announcement;
  testID: string;
  // eslint-disable-next-line react/no-unused-prop-types
  containerStyle?: ThemedProps & { style?: ThemedProps & StyleProp<ViewStyle> };
}

export function AnnouncementBanner({
  hideAnnouncement,
  announcement,
  testID,
}: AnnouncementBannerProps): JSX.Element {
  const { isLight } = useThemeContext();
  const icons: { [key in AnnouncementData["type"]]: IconProps<any>["name"] } = {
    EMERGENCY: "warning",
    OTHER_ANNOUNCEMENT: "campaign",
    OUTAGE: "warning",
    SCAN: "campaign",
  };
  const isOtherAnnouncement =
    announcement.type === undefined ||
    announcement.type === "OTHER_ANNOUNCEMENT";

  return (
    <ThemedView
      testID={testID}
      style={tailwind("px-4 py-3 flex-row items-center")}
      light={tailwind({
        "bg-primary-700": isOtherAnnouncement,
        "bg-warning-100": !isOtherAnnouncement,
      })}
      dark={tailwind({
        "bg-darkprimary-700": isOtherAnnouncement,
        "bg-darkwarning-100": !isOtherAnnouncement,
      })}
    >
      {announcement.id !== undefined && (
        <MaterialIcons
          style={tailwind([
            "mr-1",
            {
              "text-white": !isLight || isOtherAnnouncement,
              "text-gray-900": !(!isLight || isOtherAnnouncement),
            },
          ])}
          iconType="MaterialIcons"
          name="close"
          size={18}
          onPress={() => {
            if (announcement.id === undefined) {
              return;
            }
            if (hideAnnouncement !== undefined) {
              hideAnnouncement(announcement.id);
            }
          }}
          testID="close_announcement"
        />
      )}

      <MaterialIcons
        style={tailwind([
          "mr-2.5",
          {
            "text-white": isOtherAnnouncement,
            "text-warning-600": !isOtherAnnouncement && isLight,
            "text-darkwarning-600": !isOtherAnnouncement && !isLight,
          },
        ])}
        iconType="MaterialIcons"
        name={icons[announcement.type ?? "OTHER_ANNOUNCEMENT"]}
        size={
          icons[announcement.type ?? "OTHER_ANNOUNCEMENT"] === "warning"
            ? 24
            : 28
        }
      />
      <Text
        style={tailwind([
          "text-xs flex-auto",
          {
            "text-white": !isLight || (isLight && isOtherAnnouncement),
            "text-gray-900": !isOtherAnnouncement && isLight,
          },
        ])}
        testID="announcements_text"
      >
        {`${announcement.content} `}
      </Text>
      {announcement.url !== undefined && announcement.url.length !== 0 && (
        <TouchableOpacity
          onPress={async () => await openURL(announcement.url)}
          style={tailwind("ml-2 py-1")}
        >
          <ThemedText
            style={tailwind("text-sm font-medium")}
            light={tailwind({
              "text-white": isOtherAnnouncement,
              "text-warning-600": !isOtherAnnouncement,
            })}
            dark={tailwind({
              "text-white": isOtherAnnouncement,
              "text-darkwarning-600": !isOtherAnnouncement,
            })}
          >
            {translate("components/Announcements", "DETAILS")}
          </ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

export function AnnouncementBannerV2({
  hideAnnouncement,
  announcement,
  testID,
  containerStyle,
}: AnnouncementBannerProps): JSX.Element {
  const { isLight } = useThemeContext();
  const isOtherAnnouncement =
    announcement.type === undefined ||
    announcement.type === "OTHER_ANNOUNCEMENT";
  return (
    <ThemedViewV2
      testID={testID}
      style={[
        tailwind(
          "relative px-5 py-3 flex flex-row items-center border-0.5 rounded-xl-v2",
          {
            "border-mono-light-v2-900": isOtherAnnouncement && isLight,
            "border-mono-dark-v2-900": isOtherAnnouncement && !isLight,
            "border-orange-v2": announcement.type === "OUTAGE",
            "border-red-v2": announcement.type === "EMERGENCY",
          }
        ),
        containerStyle?.style,
      ]}
      light={containerStyle?.light}
      dark={containerStyle?.dark}
    >
      <ThemedTextV2
        light={tailwind({ "text-mono-light-v2-900": isOtherAnnouncement })}
        dark={tailwind({ "text-mono-dark-v2-900": isOtherAnnouncement })}
        style={tailwind([
          "text-xs flex-auto font-normal-v2",
          {
            "text-orange-v2": announcement.type === "OUTAGE",
            "text-red-v2": announcement.type === "EMERGENCY",
          },
        ])}
        testID="announcements_text"
      >
        {`${announcement.content} `}
      </ThemedTextV2>
      {announcement.url !== undefined && announcement.url.length !== 0 && (
        <ThemedTouchableOpacityV2
          onPress={async () => await openURL(announcement.url)}
          style={tailwind("ml-3.5 pl-1 py-1")}
        >
          <ThemedIcon
            iconType="Feather"
            name="external-link"
            size={20}
            light={tailwind({ "text-mono-light-v2-900": isOtherAnnouncement })}
            dark={tailwind({ "text-mono-dark-v2-900": isOtherAnnouncement })}
            style={tailwind({
              "text-orange-v2": announcement.type === "OUTAGE",
              "text-red-v2": announcement.type === "EMERGENCY",
            })}
          />
        </ThemedTouchableOpacityV2>
      )}
      {announcement.icon !== undefined && announcement.icon.length !== 0 && (
        <ThemedIcon
          size={20}
          name={announcement.icon}
          iconType="Feather"
          light={tailwind({ "text-mono-light-v2-900": isOtherAnnouncement })}
          dark={tailwind({ "text-mono-dark-v2-900": isOtherAnnouncement })}
          style={tailwind("pl-4", {
            "text-orange-v2": announcement.type === "OUTAGE",
            "text-red-v2": announcement.type === "EMERGENCY",
          })}
        />
      )}
      {announcement.id !== undefined && (
        <ThemedViewV2 style={tailwind("absolute -top-2 -right-2 rounded-full")}>
          <ThemedTouchableOpacityV2
            onPress={() => {
              if (announcement.id === undefined) {
                return;
              }
              if (hideAnnouncement !== undefined) {
                hideAnnouncement(announcement.id);
              }
            }}
            style={tailwind("border-0")}
          >
            <ThemedIcon
              testID="close_announcement"
              iconType="MaterialIcons"
              name="cancel"
              size={20}
              light={tailwind({
                "text-mono-light-v2-900": isOtherAnnouncement,
              })}
              dark={tailwind({ "text-mono-dark-v2-900 ": isOtherAnnouncement })}
              style={tailwind("", {
                "text-orange-v2": announcement.type === "OUTAGE",
                "text-red-v2": announcement.type === "EMERGENCY",
              })}
            />
          </ThemedTouchableOpacityV2>
        </ThemedViewV2>
      )}
    </ThemedViewV2>
  );
}

export interface Announcement {
  content: string;
  url: string;
  id?: string;
  type: AnnouncementData["type"];
  icon?: string;
}

export function findDisplayedAnnouncementForVersion(
  version: string,
  language: string,
  hiddenAnnouncements: string[],
  announcements?: AnnouncementData[]
): Announcement | undefined {
  if (announcements === undefined || announcements.length === 0) {
    return;
  }

  for (const announcement of announcements) {
    const lang: any = announcement.lang;
    const platformUrl: any = announcement.url;

    if (
      ((Platform.OS !== "ios" &&
        Platform.OS !== "android" &&
        announcement.type !== "SCAN") ||
        satisfies(version, announcement.version)) &&
      getDisplayAnnouncement(hiddenAnnouncements, announcement)
    ) {
      return {
        content: lang[language] ?? lang.en,
        url: platformUrl !== undefined ? platformUrl[Platform.OS] : undefined,
        id: announcement.id,
        type: announcement.type,
      };
    }
  }
}

function getDisplayAnnouncement(
  hiddenAnnouncements: string[],
  announcement: AnnouncementData
): boolean {
  if (announcement === undefined) {
    return false;
  }

  if (hiddenAnnouncements.length > 0 && announcement.id !== undefined) {
    return !hiddenAnnouncements.includes(announcement.id);
  }

  return true;
}
