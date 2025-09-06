/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_API_BASE_PATH: string
  readonly VITE_DEV_SERVER_PORT: string
  readonly VITE_ENABLE_OFFLINE_MODE: string
  readonly VITE_ENABLE_API_MOCKING: string
  readonly VITE_LOG_LEVEL: string
  readonly VITE_PROXY_TARGET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
