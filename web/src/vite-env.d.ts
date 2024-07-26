/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly ANON_KEY: string;
  readonly API_URL: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
