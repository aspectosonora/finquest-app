import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  experimental: {
    // Reutiliza brevemente una pantalla ya visitada al cambiar de pestaña
    // (Inicio/Retos/Deudas/Metas/Equipo) para que la navegación se sienta
    // instantánea. 15s es corto a propósito: cualquier movimiento registrado
    // hace redirect() a una página dinámica (siempre fresca), y LiveSync
    // refresca al volver a primer plano, así que la ventana de datos
    // potencialmente desactualizados es mínima y nunca afecta saldos recién
    // guardados por el propio usuario.
    staleTimes: {
      dynamic: 15,
    },
  },
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
