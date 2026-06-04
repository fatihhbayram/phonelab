// PhoneLab — Admin panel fetch istemcisi.
// Backend kontratı (02-backend): httpOnly cookie ile auth; JS token saklamaz.
// Tek yapılması gereken her istekte credentials:'include'.
//
// 401 deseni: korumalı istek 401 dönerse BİR KEZ POST /api/admin/auth/refresh
// denenir, başarılıysa orijinal istek tekrarlanır. Refresh de 401 dönerse
// oturum bitmiştir → çağıran tarafa AuthExpiredError fırlatılır (→ /admin/login).

export class AuthExpiredError extends Error {
  constructor() {
    super('Oturum süresi doldu');
    this.name = 'AuthExpiredError';
  }
}

export class ApiError extends Error {
  status: number;
  details?: Record<string, string[]>;
  constructor(message: string, status: number, details?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

// Refresh'i tek uçtan yönet: eşzamanlı 401'ler tek refresh çağrısını paylaşsın.
let refreshing: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (!refreshing) {
    refreshing = fetch('/api/admin/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => { refreshing = null; });
  }
  return refreshing;
}

async function parseError(res: Response): Promise<ApiError> {
  let message = 'Bir hata oluştu';
  let details: Record<string, string[]> | undefined;
  try {
    const body = await res.json();
    if (body?.error) message = body.error;
    if (body?.details) details = body.details;
  } catch {
    /* gövde yok / json değil */
  }
  return new ApiError(message, res.status, details);
}

/**
 * Korumalı admin isteği. JSON gövde verirse otomatik serialize + header eklenir.
 * Başarısızsa ApiError; oturum geçtiyse AuthExpiredError fırlatır.
 */
export async function adminFetch<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const init: RequestInit = {
    method: options.method ?? 'GET',
    credentials: 'include',
  };
  if (options.body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(options.body);
  }

  let res = await fetch(path, init);

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (!refreshed) throw new AuthExpiredError();
    res = await fetch(path, init); // tek tekrar denemesi
    if (res.status === 401) throw new AuthExpiredError();
  }

  if (!res.ok) throw await parseError(res);

  if (res.status === 204) return undefined as T;
  const json = await res.json();
  return json.data as T;
}

// Oturum kontrolü — dashboard mount'unda kullanılır.
export interface AdminIdentity { id: number | string; username: string }
export function fetchMe() {
  return adminFetch<AdminIdentity>('/api/admin/auth/me');
}

export function logout() {
  return fetch('/api/admin/auth/logout', { method: 'POST', credentials: 'include' });
}
