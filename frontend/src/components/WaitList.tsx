import { useState } from 'react';
import { WaitlistEntry, WaitlistForm } from '../types';
import { api } from '../api';

interface Props {
  entries: WaitlistEntry[];
  onUpdate: () => void;
}

export default function WaitList({ entries, onUpdate }: Props) {
  const [form, setForm] = useState<WaitlistForm>({ user_name: '', car_plate: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.addToWaitlist({
        user_name: form.user_name.trim(),
        car_plate: form.car_plate.trim().toUpperCase(),
        phone: form.phone.trim() || undefined,
      });
      setForm({ user_name: '', car_plate: '', phone: '' });
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Hinzufügen');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: number) => {
    try {
      await api.removeFromWaitlist(id);
      onUpdate();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fehler');
    }
  };

  const waiting = entries.filter((e) => e.notified === 0);
  const notified = entries.filter((e) => e.notified === 1);

  return (
    <div className="space-y-6">
      {/* Add to waitlist form */}
      <div className="card">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Zur Warteliste hinzufügen</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label" htmlFor="wl-name">
              Name
            </label>
            <input
              id="wl-name"
              className="input"
              placeholder="Max Mustermann"
              value={form.user_name}
              onChange={(e) => setForm({ ...form, user_name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="wl-plate">
              Kennzeichen
            </label>
            <input
              id="wl-plate"
              className="input"
              placeholder="MZ-AB 1234"
              value={form.car_plate}
              onChange={(e) => setForm({ ...form, car_plate: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="wl-phone">
              Telefon (optional)
            </label>
            <input
              id="wl-phone"
              className="input"
              type="tel"
              placeholder="+49 123 456789"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Wird gespeichert…' : '+ Zur Warteliste'}
          </button>
        </form>
      </div>

      {/* Waiting list */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          Warteliste ({waiting.length})
        </h3>
        {waiting.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Keine Einträge</p>
        ) : (
          <div className="space-y-2">
            {waiting.map((entry, idx) => (
              <div key={entry.id} className="card flex items-center gap-3">
                <span className="flex-shrink-0 h-7 w-7 rounded-full bg-green-100 text-green-700 font-bold text-sm flex items-center justify-center">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{entry.user_name}</p>
                  <p className="text-xs text-gray-500">
                    {entry.car_plate}
                    {entry.phone && ` · ${entry.phone}`}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(entry.id)}
                  className="btn-secondary text-xs px-2.5 py-1.5 shrink-0"
                  title="Entfernen"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notified list */}
      {notified.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Benachrichtigt ({notified.length})
          </h3>
          <div className="space-y-2">
            {notified.map((entry) => (
              <div key={entry.id} className="card flex items-center gap-3 opacity-60">
                <span className="flex-shrink-0 h-7 w-7 rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center">
                  ✓
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{entry.user_name}</p>
                  <p className="text-xs text-gray-500">{entry.car_plate} · Benachrichtigt</p>
                </div>
                <button
                  onClick={() => handleRemove(entry.id)}
                  className="btn-secondary text-xs px-2.5 py-1.5 shrink-0"
                  title="Entfernen"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
