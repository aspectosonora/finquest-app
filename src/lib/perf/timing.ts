import "server-only";

/**
 * Instrumentación TEMPORAL de diagnóstico (rama perf/native-feel, no producción).
 * Mide tiempo real de auth/Prisma/render por request para aislar dónde se va
 * el ~1s por pantalla. Quitar antes de fusionar a main.
 */
export async function timed<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  try {
    return await fn();
  } finally {
    console.log(`[perf] ${label} ${Date.now() - start}ms`);
  }
}
