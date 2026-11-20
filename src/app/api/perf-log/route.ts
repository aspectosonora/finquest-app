import { NextResponse } from "next/server";

/**
 * Instrumentación TEMPORAL de diagnóstico (rama perf/native-feel). Solo
 * imprime el tap-to-paint reportado por el cliente para leerlo en los logs
 * de Vercel. No guarda nada, no requiere auth (no hay datos sensibles: solo
 * ruta, milisegundos y user-agent).
 */
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const data = JSON.parse(body);
    console.log(`[nav-timing] ${data.pathname} ${data.deltaMs}ms ua=${data.ua}`);
  } catch {
    // ignore malformed beacons
  }
  return new NextResponse(null, { status: 204 });
}
