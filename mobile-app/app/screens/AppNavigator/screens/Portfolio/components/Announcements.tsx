import {
  ThemedIcon,
  ThemedProps,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import { useStyles } from "@tailwind";
import { useGetAnnouncementsQuery } from "@store/website";
import { AnnouncementData } from "@shared-types/website";
import { satisfies } from "semver";
import { useLanguageContext } from "@shared-contexts/LanguageProvider";
import { openURL } from "@api/linking";
import { Platform, StyleProp, ViewStyle } from "react-native";
import { nativeApplicationVersion } from "expo-application";
import { useEffect, useState } from "react";
import { useApiStatus } from "@hooks/useApiStatus";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { useServiceProviderContext } from "@contexts/StoreServiceProvider";
import {
  blockChainIsDownContent,
  useDeFiChainStatus,
} from "../hooks/DeFiChainStatus";
import { useDisplayAnnouncement } from "../hooks/DisplayAnnouncement";

export function Announcements(): JSX.Element {
  const { tailwind } = useStyles();
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
    <AnnouncementBanner
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
  containerStyle?: ThemedProps & { style?: ThemedProps & StyleProp<ViewStyle> };
}

export function AnnouncementBanner({
  hideAnnouncement,
  announcement,
  testID,
  containerStyle,
}: AnnouncementBannerProps): JSX.Element {
  const { tailwind } = useStyles();
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
