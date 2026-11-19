export type CelebrationPayload =
  | { type: "confetti" }
  | { type: "ko" }
  | { type: "levelup"; level: number }
  | { type: "goal"; name?: string }
  | { type: "chest" };

const EVENT_NAME = "finquest:celebrate";

/** Dispara una celebración global. Úsalo justo después de confirmar que la operación se guardó. */
export function celebrate(payload: CelebrationPayload) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<CelebrationPayload>(EVENT_NAME, { detail: payload }));
}

export function onCelebrate(handler: (payload: CelebrationPayload) => void) {
  if (typeof window === "undefined") return () => {};
  const listener = (e: Event) => handler((e as CustomEvent<CelebrationPayload>).detail);
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}
