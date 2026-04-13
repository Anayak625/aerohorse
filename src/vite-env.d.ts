/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Set to `"true"` to show the bottom payment-notice bar (build-time). */
  readonly VITE_SHOW_PAYMENT_BAR?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
