/**
 * ZES API Client — connects the dashboard to Flask backend (:5002)
 * Falls back to mock data when backend is unreachable.
 */

const API_BASE = "http://127.0.0.1:5002/api";

export interface ServiceHealth {
  name: string;
  port: number;
  running: boolean;
}

export interface SystemInfo {
  memory: { total: string; used: string; percent: number };
  disk: { total: string; used: string; percent: number };
  uptime: string;
  hostname: string;
  load: number[];
}

export interface ServiceStatus {
  name: string;
  status: string;
  raw?: string;
}

export type FetchState<T> =
  | { status: "loading" }
  | { status: "ok"; data: T }
  | { status: "error"; error: string };

async function fetchJSON<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getHealth(): Promise<ServiceHealth[] | null> {
  const data = await fetchJSON<{ services: Record<string, { port: number; running: boolean }> }>(`${API_BASE}/health`);
  if (!data?.services) return null;
  return Object.entries(data.services).map(([name, info]) => ({
    name,
    port: info.port,
    running: info.running,
  }));
}

export async function getSystemInfo(): Promise<SystemInfo | null> {
  return fetchJSON<SystemInfo>(`${API_BASE}/system`);
}

export async function getServices(): Promise<ServiceStatus[] | null> {
  const data = await fetchJSON<{ services: ServiceStatus[] }>(`${API_BASE}/services`);
  return data?.services ?? null;
}

export async function startService(name: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/services/${name}/start`, { method: "POST" });
  return res.ok;
}

export async function stopService(name: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/services/${name}/stop`, { method: "POST" });
  return res.ok;
}
