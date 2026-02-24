/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_ALLOW_CROSS_ORIGIN_API?: string;
  readonly VITE_ALLOW_CROSS_ORIGIN_BEARER?: string;
  readonly VITE_API_PROXY_TARGET?: string;
  readonly VITE_API_BEARER_TOKEN?: string;
  readonly VITE_TAILWIND_SCRIPT_URL?: string;
  readonly VITE_MATERIAL_ICONS_URL?: string;
  readonly VITE_MATERIAL_SYMBOLS_URL?: string;
  readonly VITE_COMMON_GOOGLE_FONTS_URL?: string;
  readonly VITE_DEV_HOST?: string;
  readonly VITE_DEV_PORT?: string;
  readonly VITE_RENDER_API_BASE_URL?: string;
  readonly VITE_RENDER_API_BEARER_TOKEN?: string;
  readonly VITE_RENDER_API_PORT?: string;
  readonly VITE_PNG_RENDERER_DEFAULT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
