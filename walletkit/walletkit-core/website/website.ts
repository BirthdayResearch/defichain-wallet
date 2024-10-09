import { EnvironmentNetwork } from "../api/environment";

export interface AnnouncementText {
  en: string;
  de: string;
  "zh-Hans": string;
  "zh-Hant": string;
  fr?: string;
  es: string;
  it: string;
}

export interface AnnouncementData {
  lang: AnnouncementText;
  /**
   * Versioned matching represented as semver satisfies
   */
  version: string;
  url?: {
    ios: string;
    android: string;
    macos: string;
    windows: string;
    web: string;
  };
  /**
   * `id` will be stored in device's persistence storage. Therefore, each announcement's `id` should be unique string to enable close announcement function
   */
  id?: string;
  type: "EMERGENCY" | "OTHER_ANNOUNCEMENT" | "OUTAGE" | "SCAN";
}

export interface FeatureFlag {
  id: FeatureFlagID;
  name: string;
  version: string;
  stage: FeatureFlagStage;
  description: string;
  networks: EnvironmentNetwork[];
  platforms: Platform[];
  app: App[];
}

export interface DeFiChainStatus {
  page?: {
    id: string;
    name: string;
    url: string;
    updated_at: string;
  };
  status: {
    description: "operational" | "outage";
    indicator: string;
  };
  components?: Array<{
    created_at: string;
    description?: string;
    id: string;
    name: string;
    page_id: string;
    position: number;
    status: string;
    updated_at: string;
  }>;
  incidents?: Array<{
    created_at: string;
    id: string;
    impact: string;
    incident_updates: Array<{
      body: string;
      created_at: string;
      display_at: string;
      id: string;
      incident_id: string;
      status: string;
      updated_at: string;
    }>;
    monitoring_at?: string;
    name: string;
    page_id?: string;
    resolved_at?: string;
    shortlink: string;
    status: string;
    updated_at: string;
  }>;
  scheduled_maintenances: Array<{
    created_at: string;
    id: string;
    impact: string;
    incident_updates: Array<{
      body: string;
      created_at: string;
      display_at: string;
      id: string;
      incident_id: string;
      status: string;
      updated_at: string;
    }>;
    monitoring_at?: string;
    name: string;
    page_id: string;
    resolved_at?: string;
    scheduled_for: string;
    scheduled_until: string;
    shortlink: string;
    status: "Scheduled" | "In Progress" | "Verifying" | "Completed";
    updated_at: string;
  }>;
}

export interface PoolpairWithStabInfo {
  pairDisplaySymbol: string;
  tokenADisplaySymbol: string;
  tokenBDisplaySymbol: string;
  dexStabilizationFee: string;
}

export type Platform = "ios" | "android" | "windows" | "macos" | "web";

export type App = "MOBILE_LW" | "DESKTOP_LW" | "SCAN";

export type FeatureFlagID =
  | "loan"
  | "auction"
  | "dfi_loan_payment"
  | "local_storage"
  | "dusd_vault_share"
  | "dusd_loan_payment"
  | "future_swap"
  | "service_provider"
  | "onboarding_v2"
  | "dusd_dex_high_fee"
  | "dusd_dfi_high_fee"
  | "setting_v2"
  | "portfolio_v2"
  | "add_liquidity_v2"
  | "remove_liquidity_v2"
  | "send_v2"
  | "composite_swap_v2"
  | "unloop_dusd"
  | "ocg_cfp_dfip"
  | "evm"
  | "loop_dusd"
  | "save_tx";

// Stages of feature flag
export type FeatureFlagStage = "alpha" | "beta" | "public";
