/**
 * Frontend API client for GETON Kenya backend.
 *
 * Usage:
 *   import { api } from "./lib/api";
 *   await api.auth.register({...});
 *   await api.loans.apply({...});
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
const ACCESS_TOKEN_KEY = "geton_access_token";
const REFRESH_TOKEN_KEY = "geton_refresh_token";

let accessToken: string | null = localStorage.getItem(ACCESS_TOKEN_KEY);
let refreshToken: string | null = localStorage.getItem(REFRESH_TOKEN_KEY);

function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// =============== HTTP Client ===============

class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-device-name":
      (navigator as any).userAgentData?.platform || navigator.platform,
    "x-device-os": navigator.userAgent,
    "x-device-id": getDeviceId(),
    ...(options.headers as Record<string, string> | undefined),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Token expired — try refreshing once
  if (response.status === 401 && refreshToken && !isRetry) {
    if (isRefreshing) {
      // Wait for in-progress refresh
      return new Promise((resolve, reject) => {
        refreshSubscribers.push((newToken) => {
          headers["Authorization"] = `Bearer ${newToken}`;
          fetch(url, { ...options, headers })
            .then((r) => handleResponse<T>(r))
            .then(resolve)
            .catch(reject);
        });
      });
    }

    isRefreshing = true;
    try {
      const r = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (r.ok) {
        const { data } = await r.json();
        setTokens(data.accessToken, data.refreshToken);
        isRefreshing = false;
        refreshSubscribers.forEach((cb) => cb(data.accessToken));
        refreshSubscribers = [];
        // Retry the original request
        headers["Authorization"] = `Bearer ${data.accessToken}`;
        const retry = await fetch(url, { ...options, headers });
        return handleResponse<T>(retry);
      } else {
        clearTokens();
        isRefreshing = false;
        throw new ApiError(401, "UNAUTHORIZED", "Session expired");
      }
    } catch (err) {
      isRefreshing = false;
      throw err;
    }
  }

  return handleResponse<T>(response);
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      response.status,
      json?.error?.code ?? "ERROR",
      json?.error?.message ?? `Request failed (${response.status})`,
      json?.error?.details,
    );
  }
  return json.data ?? json;
}

function getDeviceId(): string {
  let id = localStorage.getItem("geton_device_id");
  if (!id) {
    id = `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem("geton_device_id", id);
  }
  return id;
}

// =============== API surface ===============

export const api = {
  // -------- Auth --------
  auth: {
    async register(data: {
      fullName: string;
      email: string;
      phone: string;
      password: string;
      referralCode?: string;
    }) {
      const res = await request<{
        user: any;
        accessToken: string;
        refreshToken: string;
      }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setTokens(res.accessToken, res.refreshToken);
      return res;
    },

    async login(data: { email?: string; phone?: string; password: string }) {
      const res = await request<{
        user: any;
        accessToken: string;
        refreshToken: string;
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setTokens(res.accessToken, res.refreshToken);
      return res;
    },

    async logout() {
      try {
        await request("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // ignore
      }
      clearTokens();
    },

    async forgotPassword(phone: string) {
      return request<{ devOtp?: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ phone }),
      });
    },

    async resetPassword(data: {
      phone: string;
      code: string;
      newPassword: string;
    }) {
      return request("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    async changePassword(data: {
      currentPassword: string;
      newPassword: string;
    }) {
      return request("/auth/change-password", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    async setPin(pin: string) {
      return request("/auth/pin", {
        method: "POST",
        body: JSON.stringify({ pin }),
      });
    },

    async sendPhoneOtp() {
      return request<{ devOtp?: string }>("/auth/phone/send-otp", {
        method: "POST",
      });
    },

    async verifyPhone(code: string) {
      return request("/auth/phone/verify", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
    },

    isAuthed: () => !!accessToken,
    getToken: () => accessToken,
  },

  // -------- User --------
  user: {
    me: () => request<any>("/users/me"),
    update: (data: any) =>
      request("/users/me", { method: "PATCH", body: JSON.stringify(data) }),
    stats: () => request<any>("/users/me/stats"),
    devices: () => request<any[]>("/users/me/devices"),
    revokeDevice: (id: string) =>
      request(`/users/me/devices/${id}`, { method: "DELETE" }),
  },

  // -------- Loans --------
  loans: {
    calculate: (amount: number, tenure: number) =>
      request<any>("/loans/calculate", {
        method: "POST",
        body: JSON.stringify({ amount, tenure }),
      }),

    apply: (data: { amount: number; tenure: number; purpose: string }) =>
      request<any>("/loans/apply", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    list: () => request<any[]>("/loans"),

    get: (id: string) => request<any>(`/loans/${id}`),

    disburse: (id: string) =>
      request<any>(`/loans/${id}/disburse`, { method: "POST" }),

    repay: (id: string, data: { amount: number; phone: string }) =>
      request<any>(`/loans/${id}/repay`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    cancel: (id: string) =>
      request<any>(`/loans/${id}/cancel`, { method: "POST" }),
  },

  // -------- Payments --------
  payments: {
    initiateActivation: (data: { loanId: string; phone: string }) =>
      request<{
        intentId: string;
        reference: string;
        status: string;
        authorizationUrl: string;
        message: string;
      }>("/payments/activation", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    verify: (reference: string) =>
      request<any>("/payments/verify", {
        method: "POST",
        body: JSON.stringify({ reference }),
      }),
  },

  // -------- KYC --------
  kyc: {
    get: () => request<any>("/kyc"),
    submit: (data: any) =>
      request("/kyc", { method: "POST", body: JSON.stringify(data) }),
    upload: (data: { type: string; url: string }) =>
      request("/kyc/upload", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // -------- Wallet --------
  wallet: {
    get: () => request<{ balance: number }>("/wallet"),
    deposit: (data: { amount: number; phone: string }) =>
      request("/wallet/deposit", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    withdraw: (data: { amount: number; phone?: string; destination?: "mpesa" | "bank" }) =>
      request("/wallet/withdraw", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // -------- Transactions --------
  transactions: {
    list: (params?: { type?: string; limit?: number; cursor?: string }) => {
      const search = new URLSearchParams();
      if (params?.type) search.set("type", params.type);
      if (params?.limit) search.set("limit", String(params.limit));
      if (params?.cursor) search.set("cursor", params.cursor);
      const q = search.toString();
      return request<{ transactions: any[]; nextCursor: string | null }>(
        `/transactions${q ? "?" + q : ""}`,
      );
    },
    get: (id: string) => request<any>(`/transactions/${id}`),
  },

  // -------- Notifications --------
  notifications: {
    list: (unreadOnly = false) =>
      request<{ items: any[]; unread: number }>(
        `/notifications${unreadOnly ? "?unreadOnly=true" : ""}`,
      ),
    markRead: (id: string) =>
      request(`/notifications/${id}/read`, { method: "POST" }),
    markAllRead: () => request("/notifications/read-all", { method: "POST" }),
  },

  // -------- Referrals --------
  referrals: {
    get: () => request<{ code: string; link: string; invited: number; successful: number; earned: number }>("/referrals"),
  },
};

export { ApiError };
export const API_BASE = API_URL;
