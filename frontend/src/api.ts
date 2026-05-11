const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Fehler ${res.status}`);
  }
  return data as T;
}

export const api = {
  // Stations
  getStations: () => request<import('./types').Station[]>('/stations'),
  getStation: (id: number) => request<import('./types').Station>(`/stations/${id}`),
  checkin: (id: number, body: { user_name: string; car_plate: string }) =>
    request(`/stations/${id}/checkin`, { method: 'POST', body: JSON.stringify(body) }),
  checkout: (id: number) =>
    request<{ message: string; notified: { id: number; user_name: string } | null }>(
      `/stations/${id}/checkout`,
      { method: 'POST' }
    ),
  setStatus: (id: number, status: string) =>
    request(`/stations/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Waitlist
  getWaitlist: () => request<import('./types').WaitlistEntry[]>('/waitlist'),
  addToWaitlist: (body: { user_name: string; car_plate: string; phone?: string }) =>
    request<import('./types').WaitlistEntry>('/waitlist', { method: 'POST', body: JSON.stringify(body) }),
  removeFromWaitlist: (id: number) =>
    request(`/waitlist/${id}`, { method: 'DELETE' }),

  // QR code
  getQRCode: (id: number) =>
    request<{ stationId: string; url: string; qrCode: string }>(`/qr/${id}`),
};
