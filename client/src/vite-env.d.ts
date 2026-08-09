/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Absolute backend URL for packaged native builds (empty = same origin). */
  readonly VITE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
