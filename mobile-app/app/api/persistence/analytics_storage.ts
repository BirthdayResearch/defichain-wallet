const STORAGE_PREFIX_KEY = "WALLET.";

export function getStorageItem<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }
  const prefixedKey = `${STORAGE_PREFIX_KEY}${key}`;
  const currentValue = JSON.parse(
    localStorage.getItem(prefixedKey) || String(null),
  );
  return currentValue === null ? undefined : currentValue;
}

export function setStorageItem<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }
  const prefixedKey = `${STORAGE_PREFIX_KEY}${key}`;
  localStorage.setItem(prefixedKey, JSON.stringify(value));
}
