export const sessionExpiredEventName = "salary-management:session-expired";
const tokenStorageKey = "salary-management-token";
const userDetailsStorageKey = "salary-management-user-details";
const cookieAttributes = "Path=/; SameSite=Lax";

export type SessionUserDetails = {
  firstName: string;
  lastName: string;
  organizationName: string;
};

function getCookieValue(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const encodedPrefix = `${encodeURIComponent(name)}=`;
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(encodedPrefix));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.slice(encodedPrefix.length));
}

function setCookieValue(name: string, value: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; ${cookieAttributes}`;
}

function clearCookieValue(name: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${encodeURIComponent(name)}=; ${cookieAttributes}; Max-Age=0`;
}

export function getSessionToken() {
  return getCookieValue(tokenStorageKey);
}

export function setSessionToken(token: string) {
  setCookieValue(tokenStorageKey, token);
}

export function clearSessionToken() {
  clearCookieValue(tokenStorageKey);
}

export function setSessionUserDetails(user: SessionUserDetails) {
  setCookieValue(
    userDetailsStorageKey,
    JSON.stringify({
      firstName: user.firstName,
      lastName: user.lastName,
      organizationName: user.organizationName
    })
  );
}

export function getSessionUserDetails(): SessionUserDetails | null {
  const value = getCookieValue(userDetailsStorageKey);

  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<SessionUserDetails>;

    return {
      firstName: typeof parsed.firstName === "string" ? parsed.firstName : "",
      lastName: typeof parsed.lastName === "string" ? parsed.lastName : "",
      organizationName:
        typeof parsed.organizationName === "string" ? parsed.organizationName : ""
    };
  } catch {
    return null;
  }
}

export function getSessionUserDisplayName() {
  const user = getSessionUserDetails();
  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();

  return fullName || "User";
}

export function getSessionOrganizationName() {
  const organizationName = getSessionUserDetails()?.organizationName.trim();

  return organizationName || "Organization";
}

export function clearSessionUserDetails() {
  clearCookieValue(userDetailsStorageKey);
}

export function notifySessionExpired() {
  window.dispatchEvent(new Event(sessionExpiredEventName));
}
