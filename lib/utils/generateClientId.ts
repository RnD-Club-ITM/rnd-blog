export function generateClientId() {
  if (
    typeof globalThis !== "undefined" &&
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  if (
    typeof globalThis !== "undefined" &&
    globalThis.crypto &&
    typeof globalThis.crypto.getRandomValues === "function"
  ) {
    const buffer = new Uint8Array(16);
    globalThis.crypto.getRandomValues(buffer);
    return Array.from(buffer, (value) => value.toString(16).padStart(2, "0")).join("");
  }

  return `fallback-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
