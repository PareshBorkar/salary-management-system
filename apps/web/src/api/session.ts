export const sessionExpiredEventName = "salary-management:session-expired";
const tokenStorageKey = "salary-management-token";
const cookieAttributes = "Path=/; SameSite=Lax";

export function getSessionToken() {
  const encodedPrefix = `${encodeURIComponent(tokenStorageKey)}=`;
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(encodedPrefix));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.slice(encodedPrefix.length));
}

export function setSessionToken(token: string) {
  document.cookie = `${encodeURIComponent(tokenStorageKey)}=${encodeURIComponent(token)}; ${cookieAttributes}`;
}

export function clearSessionToken() {
  document.cookie = `${encodeURIComponent(tokenStorageKey)}=; ${cookieAttributes}; Max-Age=0`;
}

export function notifySessionExpired() {
  window.dispatchEvent(new Event(sessionExpiredEventName));
}
