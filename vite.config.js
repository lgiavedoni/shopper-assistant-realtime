import { join, dirname } from "path";
import { fileURLToPath } from "url";

import viteReact from "@vitejs/plugin-react";
import viteFastifyReact from "@fastify/react/plugin";

const path = fileURLToPath(import.meta.url);

export default {
  root: join(dirname(path), "client"),
  publicDir: join(dirname(path), "public"),
  plugins: [viteReact(), viteFastifyReact()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true
  },
  ssr: {
    external: ["use-sync-external-store"],
    noExternal: ['@googlemaps/js-api-loader']
  },
 
  // define: {
  //   'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY': JSON.stringify(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
  // }
};
