/**
 * Tag único para la caché de 5s de las pantallas de solo lectura
 * (dashboard-cached.ts). Se invalida en cada mutación financiera para
 * garantizar que, justo después de registrar/editar/eliminar algo, la
 * siguiente lectura (de cualquiera de los dos) sea siempre fresca.
 *
 * Un solo tag compartido entre equipos es intencional: esta app tiene muy
 * pocos equipos, así que una invalidación global es simple y segura (nunca
 * muestra datos viejos) a cambio de invalidar, en el peor caso, un poco más
 * de lo estrictamente necesario — nunca menos.
 */
export const FINANCE_CACHE_TAG = "finance-dashboard";
