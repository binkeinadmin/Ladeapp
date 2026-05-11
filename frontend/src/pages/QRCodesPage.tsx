import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const STATION_COUNT = 6;
const BASE_URL = window.location.origin;

export default function QRCodesPage() {
  const [baseUrl, setBaseUrl] = useState(BASE_URL);

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const stations = Array.from({ length: STATION_COUNT }, (_, i) => ({
    id: i + 1,
    name: `Ladestation ${i + 1}`,
    location: `Stellplatz ${i + 1}`,
    url: `${baseUrl}/station/${i + 1}`,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Link to="/" className="text-gray-400 hover:text-gray-600 text-xl">←</Link>
            <div>
              <h1 className="text-base font-bold text-gray-900">QR-Codes drucken</h1>
              <p className="text-xs text-gray-400">Scan zum Anmelden an der Ladestation</p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="btn-primary text-sm"
          >
            🖨 Drucken
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 print:gap-4">
          {stations.map((station) => (
            <div
              key={station.id}
              className="card flex flex-col items-center gap-4 text-center print:border print:border-gray-300 print:shadow-none"
            >
              <div>
                <h2 className="text-lg font-bold text-gray-900">{station.name}</h2>
                <p className="text-sm text-gray-500">{station.location}</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <QRCodeSVG
                  value={station.url}
                  size={180}
                  level="M"
                  includeMargin={false}
                />
              </div>

              <div className="space-y-1">
                <p className="text-xs text-gray-400 break-all">{station.url}</p>
                <p className="text-xs font-medium text-green-700">
                  QR-Code scannen zum Anmelden ⚡
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <style>{`
        @media print {
          header { display: none; }
          body { background: white; }
          .card { break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
