import { useEffect, useState, useCallback } from 'react';
import { Station, WaitlistEntry } from '../types';
import { api } from '../api';
import StationCard from './StationCard';
import WaitList from './WaitList';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stations, setStations] = useState<Station[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stations' | 'waitlist'>('stations');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      const [s, w] = await Promise.all([api.getStations(), api.getWaitlist()]);
      setStations(s);
      setWaitlist(w);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Subscribe to SSE for live updates
    const evtSource = new EventSource('/api/events');
    evtSource.addEventListener('update', () => loadData());
    evtSource.onerror = () => {
      // fallback: poll every 15 s
    };

    // Fallback polling every 15 s
    const poll = setInterval(loadData, 15000);

    return () => {
      evtSource.close();
      clearInterval(poll);
    };
  }, [loadData]);

  const handleCheckout = async (id: number) => {
    try {
      const result = await api.checkout(id);
      showToast(
        result.notified
          ? `Ladevorgang beendet. ${result.notified.user_name} wurde benachrichtigt! 🔔`
          : 'Ladevorgang beendet. Station ist jetzt verfügbar.'
      );
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fehler');
    }
  };

  const handleSetOffline = async (id: number) => {
    try {
      await api.setStatus(id, 'offline');
      showToast('Station wurde offline gesetzt.');
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fehler');
    }
  };

  const handleSetAvailable = async (id: number) => {
    try {
      await api.setStatus(id, 'available');
      showToast('Station ist jetzt wieder verfügbar.');
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fehler');
    }
  };

  const available = stations.filter((s) => s.status === 'available').length;
  const occupied = stations.filter((s) => s.status === 'occupied').length;
  const offline = stations.filter((s) => s.status === 'offline').length;
  const waiting = waitlist.filter((w) => w.notified === 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <div className="text-4xl">⚡</div>
          <p className="text-gray-500">Wird geladen…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">⚡</span>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">Ladeapp</h1>
              <p className="text-xs text-gray-400">Hasengartenstraße</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/qrcodes" className="btn-secondary text-xs">
              🖨 QR-Codes
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Stats summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Verfügbar', value: available, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Belegt', value: occupied, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Offline', value: offline, color: 'text-gray-500', bg: 'bg-gray-100' },
            { label: 'Wartend', value: waiting, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((stat) => (
            <div key={stat.label} className={`card ${stat.bg} border-0`}>
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {(['stations', 'waitlist'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'stations' ? `Ladestationen (${stations.length})` : `Warteliste (${waiting})`}
            </button>
          ))}
        </div>

        {activeTab === 'stations' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stations.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                onCheckout={handleCheckout}
                onSetOffline={handleSetOffline}
                onSetAvailable={handleSetAvailable}
              />
            ))}
          </div>
        )}

        {activeTab === 'waitlist' && (
          <WaitList entries={waitlist} onUpdate={loadData} />
        )}
      </main>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-3 rounded-2xl shadow-xl z-50 max-w-sm text-center transition-all">
          {toast}
        </div>
      )}
    </div>
  );
}
