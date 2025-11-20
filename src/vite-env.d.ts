/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_HOME_URL: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ENV_NAME: 'dev' | 'it' | 'production';
  // 他にも使っている VITE_XXX をここに追加
  // readonly VITE_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
