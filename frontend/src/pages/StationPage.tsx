import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Station } from '../types';
import { api } from '../api';

export default function StationPage() {
  const { id } = useParams<{ id: string }>();
  const stationId = Number(id);

  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ user_name: '', car_plate: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [view, setView] = useState<'info' | 'checkin' | 'done'>('info');

  const load = async () => {
    try {
      const s = await api.getStation(stationId);
      setStation(s);
    } catch {
      setStation(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationId]);

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.checkin(stationId, {
        user_name: form.user_name.trim(),
        car_plate: form.car_plate.trim().toUpperCase(),
      });
      setSuccess(`Ladevorgang gestartet! Gute Fahrt, ${form.user_name}. ⚡`);
      setView('done');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Anmelden');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckout = async () => {
    setSubmitting(true);
    try {
      const result = await api.checkout(stationId);
      setSuccess(
        result.notified
          ? `Ladevorgang beendet. ${result.notified.user_name} wurde benachrichtigt! 🔔`
          : 'Ladevorgang beendet. Danke! ✅'
      );
      setView('done');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Abmelden');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-3">
          <div className="text-5xl animate-pulse">⚡</div>
          <p className="text-gray-500">Wird geladen…</p>
        </div>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="card max-w-sm w-full text-center space-y-4">
          <div className="text-5xl">❌</div>
          <h2 className="text-lg font-bold text-gray-900">Station nicht gefunden</h2>
          <Link to="/" className="btn-primary w-full">
            Zum Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (view === 'done') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="card max-w-sm w-full text-center space-y-5">
          <div className="text-5xl">✅</div>
          <p className="text-base text-gray-800">{success}</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                setView('info');
                setSuccess('');
              }}
              className="btn-secondary w-full"
            >
              Zurück zur Station
            </button>
            <Link to="/" className="btn-primary w-full">
              Zum Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusColor =
    station.status === 'available'
      ? 'bg-green-500'
      : station.status === 'occupied'
      ? 'bg-red-500'
      : 'bg-gray-400';

  const statusLabel =
    station.status === 'available'
      ? 'Verfügbar'
      : station.status === 'occupied'
      ? 'Belegt'
      : 'Offline';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-2.5">
          <Link to="/" className="text-gray-400 hover:text-gray-600 text-xl leading-none">←</Link>
          <div>
            <h1 className="text-base font-bold text-gray-900">{station.name}</h1>
            <p className="text-xs text-gray-400">{station.location}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6 space-y-4">
        {/* Status indicator */}
        <div className="card text-center space-y-2">
          <div className={`mx-auto h-14 w-14 rounded-full ${statusColor} flex items-center justify-center text-white text-2xl shadow-lg`}>
            ⚡
          </div>
          <h2 className="text-xl font-bold text-gray-900">{station.name}</h2>
          <p className="text-sm text-gray-500">{station.location}</p>
          <span
            className={
              station.status === 'available'
                ? 'badge-available'
                : station.status === 'occupied'
                ? 'badge-occupied'
                : 'badge-offline'
            }
          >
            {statusLabel}
          </span>
        </div>

        {/* Occupied info */}
        {station.status === 'occupied' && station.user_name && (
          <div className="card bg-red-50 border-l-4 border-l-red-500 space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Aktueller Ladevorgang</h3>
            <div className="text-sm space-y-1">
              <p>
                <span className="text-gray-500">Fahrer: </span>
                <span className="font-medium">{station.user_name}</span>
              </p>
              <p>
                <span className="text-gray-500">Kennzeichen: </span>
                <span className="font-medium">{station.car_plate}</span>
              </p>
            </div>
            <button
              onClick={handleCheckout}
              disabled={submitting}
              className="btn-danger w-full mt-2"
            >
              {submitting ? 'Wird abgemeldet…' : '⏹ Ladevorgang beenden'}
            </button>
          </div>
        )}

        {/* Check-in form */}
        {station.status === 'available' && view === 'info' && (
          <div className="card space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Anmelden zum Laden</h3>
            <button
              onClick={() => setView('checkin')}
              className="btn-primary w-full"
            >
              ⚡ Ladevorgang starten
            </button>
          </div>
        )}

        {station.status === 'available' && view === 'checkin' && (
          <div className="card space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Anmelden zum Laden</h3>
            <form onSubmit={handleCheckin} className="space-y-3">
              <div>
                <label className="label" htmlFor="ci-name">Ihr Name</label>
                <input
                  id="ci-name"
                  className="input"
                  placeholder="Max Mustermann"
                  value={form.user_name}
                  onChange={(e) => setForm({ ...form, user_name: e.target.value })}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="label" htmlFor="ci-plate">Kennzeichen</label>
                <input
                  id="ci-plate"
                  className="input"
                  placeholder="MZ-AB 1234"
                  value={form.car_plate}
                  onChange={(e) => setForm({ ...form, car_plate: e.target.value })}
                  required
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button type="submit" className="btn-primary w-full" disabled={submitting}>
                {submitting ? 'Wird gestartet…' : '⚡ Jetzt anmelden'}
              </button>
              <button
                type="button"
                onClick={() => setView('info')}
                className="btn-secondary w-full"
              >
                Abbrechen
              </button>
            </form>
          </div>
        )}

        {station.status === 'offline' && (
          <div className="card text-center text-gray-500 space-y-2">
            <div className="text-3xl">🔧</div>
            <p className="text-sm">Diese Station ist derzeit offline.</p>
          </div>
        )}

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      </main>
    </div>
  );
}
