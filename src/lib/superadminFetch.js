/**
 * Fetch against the superadmin API with the HttpOnly JWT cookie.
 */
export function superadminFetch(input, init = {}) {
  const headers = { ...init.headers };
  if (
    init.body != null &&
    typeof init.body === "string" &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] = "application/json";
  }
  return fetch(input, {
    credentials: "include",
    ...init,
    headers,
  });
}
