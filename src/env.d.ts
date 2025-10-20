// Global Vite env typings used across the app
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  // add other VITE_ variables used in the project as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
