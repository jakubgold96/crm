import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * CRM INNDES: każda strona poza /login zależy od sesji użytkownika i RLS
   * (dane per-użytkownik, zawsze świeże) — nie ma tu treści do statycznego
   * cache'owania/ISR. Cache Components (domyślne od Next 16) wymusza jawne
   * oznaczanie dynamicznych tras `"use cache"`/Suspense, co nie pasuje do
   * profilu tej aplikacji — wyłączone świadomie, nie przez przeoczenie.
   */
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
