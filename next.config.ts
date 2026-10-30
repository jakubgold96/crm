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
  /*
   * Tylko `npm run dev`: pozwala otworzyć serwer deweloperski z telefonu
   * w tej samej sieci Wi-Fi (http://192.168.x.x:3000 albo http://nazwa-maca.local:3000)
   * — bez tego Next blokuje skrypty dev i strona na telefonie się nie ładuje.
   * Nie wpływa na build produkcyjny. `*` = dokładnie jeden segment adresu.
   */
  allowedDevOrigins: ['192.168.*.*', '10.*.*.*', '172.*.*.*', '*.local'],
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
