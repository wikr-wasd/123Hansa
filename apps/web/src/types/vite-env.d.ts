/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID: string;
  readonly VITE_META_PIXEL_ID: string;
  readonly VITE_TIKTOK_PIXEL_ID: string;
  readonly VITE_LINKEDIN_INSIGHT_TAG_ID: string;
  readonly VITE_SNAPCHAT_PIXEL_ID: string;
  readonly VITE_TWITTER_PIXEL_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}