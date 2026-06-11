import { toast } from 'react-toastify'

const SUPERADMIN_LOGIN_PATH =
  (import.meta.env.BASE_URL || "/chataffy/superadmin/").replace(/\/?$/, "/");
const API_URL = import.meta.env.VITE_API_URL;

function getRequestUrl(input) {
  if (typeof input === "string") return input;
  if (input instanceof Request) return input.url;
  return String(input);
}


async function clearSuperAdminSessionCookie() {
  if (!API_URL) return;
  try {
    await fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
  toast.success("Logout Successfully");
  } catch {
   
  }
}

let isRedirecting = false;
export async function redirectToSuperAdminLogin() {
  if (isRedirecting) return;

  isRedirecting = true;

  localStorage.removeItem("superAdminData");
  await clearSuperAdminSessionCookie();

  setTimeout(() => {
    window.location.href = SUPERADMIN_LOGIN_PATH;
  }, 500);
}

function shouldRedirectOnUnauthorized(requestUrl) {
  return (
    !requestUrl.includes("/login") &&
    !requestUrl.includes("/me") &&
    !requestUrl.includes("/logout")
  );
}

export async function superadminFetch(input, init = {}) {
  const headers = { ...init.headers };
  if (
    init.body != null &&
    typeof init.body === "string" &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(input, {
    credentials: "include",
    ...init,
    headers,
  });

  if (response.status === 401 && shouldRedirectOnUnauthorized(getRequestUrl(input))) {
    await redirectToSuperAdminLogin();
  }

  return response;
}
