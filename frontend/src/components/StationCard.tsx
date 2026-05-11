import { Station } from '../types';

interface Props {
  station: Station;
  onCheckout: (id: number) => void;
  onSetOffline: (id: number) => void;
  onSetAvailable: (id: number) => void;
}

function formatDuration(startTime: string): string {
  const start = new Date(startTime);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  if (hours > 0) return `${hours} Std. ${minutes} Min.`;
  return `${minutes} Min.`;
}

function StatusBadge({ status }: { status: Station['status'] }) {
  if (status === 'available')
    return (
      <span className="badge-available">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
        Verfügbar
      </span>
    );
  if (status === 'occupied')
    return (
      <span className="badge-occupied">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500 inline-block" />
        Belegt
      </span>
    );
  return (
    <span className="badge-offline">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-400 inline-block" />
      Offline
    </span>
  );
}

export default function StationCard({ station, onCheckout, onSetOffline, onSetAvailable }: Props) {
  const borderColor =
    station.status === 'available'
      ? 'border-l-green-500'
      : station.status === 'occupied'
      ? 'border-l-red-500'
      : 'border-l-gray-400';

  return (
    <div className={`card border-l-4 ${borderColor} flex flex-col gap-3`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            {station.location}
          </p>
          <h3 className="text-base font-bold text-gray-900">{station.name}</h3>
        </div>
        <StatusBadge status={station.status} />
      </div>

      {station.status === 'occupied' && station.user_name && (
        <div className="rounded-xl bg-red-50 p-3 text-sm space-y-1">
          <div className="flex gap-2">
            <span className="text-gray-500 w-24 shrink-0">Fahrer:</span>
            <span className="font-medium">{station.user_name}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 w-24 shrink-0">Kennzeichen:</span>
            <span className="font-medium">{station.car_plate}</span>
          </div>
          {station.start_time && (
            <div className="flex gap-2">
              <span className="text-gray-500 w-24 shrink-0">Ladezeit:</span>
              <span className="font-medium">{formatDuration(station.start_time)}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 mt-auto pt-1">
        {station.status === 'occupied' && (
          <button className="btn-danger flex-1 text-xs" onClick={() => onCheckout(station.id)}>
            ⏹ Abmelden
          </button>
        )}
        {station.status === 'available' && (
          <button
            className="btn-secondary flex-1 text-xs"
            onClick={() => onSetOffline(station.id)}
          >
            🔧 Offline setzen
          </button>
        )}
        {station.status === 'offline' && (
          <button
            className="btn-primary flex-1 text-xs"
            onClick={() => onSetAvailable(station.id)}
          >
            ✅ Aktivieren
          </button>
        )}
      </div>
    </div>
  );
}
