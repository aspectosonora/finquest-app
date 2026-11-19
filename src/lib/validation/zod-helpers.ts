import { z } from "zod";

/** Convierte un campo de formulario vacío en `undefined` antes de validarlo. */
function emptyToUndefined(value: unknown) {
  return value === "" || value === null ? undefined : value;
}

/** Número opcional proveniente de FormData: "" cuenta como "no capturado". */
export function optionalNumber(schema: ReturnType<typeof z.coerce.number> = z.coerce.number()) {
  return z.preprocess(emptyToUndefined, schema.optional());
}

/** Texto opcional proveniente de FormData: "" cuenta como "no capturado". */
export function optionalText(schema: z.ZodString = z.string().trim()) {
  return z.preprocess(emptyToUndefined, schema.optional());
}
