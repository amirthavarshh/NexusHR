export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

export function clearAuthSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('email');
  localStorage.removeItem('role');
  localStorage.removeItem('employeeId');
  window.dispatchEvent(new Event('auth-unauthorized'));
}

export interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

export async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include'
  };

  let url = `${BASE_URL}${path}`;
  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, val);
      }
    });
    const query = searchParams.toString();
    if (query) {
      url += `?${query}`;
    }
  }

  const response = await fetch(url, fetchOptions);

  if (response.status === 401) {
    clearAuthSession();
    throw new Error('Your session has expired. Please sign in again.');
  }

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const data = await response.json();
      errorMsg = data.message || data.error || errorMsg;
    } catch {
      errorMsg = response.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
