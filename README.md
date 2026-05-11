# Ladeapp – Lademanagement Hasengartenstraße

Web-App zur Verwaltung der **6 E-Auto Ladesäulen** am Büro Hasengartenstraße.

## Features

- 🔌 **Dashboard** – Übersicht aller 6 Ladestationen (verfügbar / belegt / offline)
- 📱 **QR-Code Anmeldung** – Fahrer scannen den QR-Code an der Säule und melden sich direkt über ihr Smartphone an
- ⏳ **Warteliste** – Wer keine freie Station findet, trägt sich in die Warteliste ein
- 🔔 **Benachrichtigung** – Sobald eine Station frei wird, wird der nächste Wartende automatisch markiert
- ⏹ **Abmeldung** – Benutzer können ihren Ladevorgang über den QR-Code oder das Dashboard beenden
- 🖨 **QR-Codes drucken** – Druckbare Ansicht aller 6 QR-Codes für das Anbringen an den Säulen

## Technologie

| Schicht | Technologie |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Datenbank | SQLite (via `better-sqlite3`) |
| Echtzeit | Server-Sent Events (SSE) + Polling-Fallback |

## Installation & Start

### Voraussetzungen
- Node.js ≥ 18
- npm ≥ 9

### 1. Abhängigkeiten installieren

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Entwicklung starten (zwei Terminals)

**Terminal 1 – Backend (Port 3001):**
```bash
cd backend
npm run dev
```

**Terminal 2 – Frontend (Port 5173):**
```bash
cd frontend
npm run dev
```

Danach die App unter **http://localhost:5173** aufrufen.

### 3. Produktion bauen

```bash
cd backend && npm run build
cd frontend && npm run build
# Backend startet und liefert das gebaute Frontend aus
cd backend && npm start
```

## Deployment auf Render

Das Repository enthält eine fertige Blueprint-Datei: `render.yaml`.

### Schritte
1. Repository nach GitHub pushen
2. In Render: **New +** -> **Blueprint**
3. GitHub-Repository auswählen und Deploy starten

Render nutzt dann automatisch:
- Build: Backend + Frontend Build
- Start: Backend-Server (liefert Frontend mit aus)
- Health Check: `/api/health`
- Persistent Disk für SQLite unter `/var/data`

### Hinweis zu Daten
Die SQLite-Datei liegt auf Render in der persistenten Disk. Dadurch bleiben Stationsdaten und Warteliste über Redeploys hinweg erhalten.

## Nutzung

### QR-Codes an den Säulen anbringen
1. Im Dashboard auf **„🖨 QR-Codes"** klicken
2. Seite drucken → QR-Codes ausschneiden und an den jeweiligen Säulen befestigen

### Ladevorgang starten (Fahrer)
1. QR-Code an der Ladesäule scannen
2. Name und Kennzeichen eingeben
3. „Jetzt anmelden" klicken → Ladevorgang läuft

### Ladevorgang beenden
- Über den selben QR-Code: Auf „Ladevorgang beenden" klicken
- Oder: Im Dashboard die Station abmelden

### Warteliste
- Wenn alle Stationen belegt sind → im Dashboard auf **„Warteliste"** wechseln
- Name und Kennzeichen eintragen (Telefonnummer optional)
- Bei nächster freier Station wird der erste Wartende automatisch markiert

## Projektstruktur

```
Ladeapp/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Express Server + SSE
│   │   ├── db.ts             # SQLite Datenbankschema & Seeding
│   │   └── routes/
│   │       ├── stations.ts   # Stations-API (checkin/checkout/status)
│   │       └── waitlist.ts   # Wartelisten-API
│   └── data/
│       └── ladeapp.db        # SQLite Datenbankdatei (wird auto-erstellt)
└── frontend/
    └── src/
        ├── App.tsx           # Routing
        ├── api.ts            # API-Client
        ├── types.ts          # TypeScript-Typen
        ├── components/
        │   ├── Dashboard.tsx # Haupt-Dashboard
        │   ├── StationCard.tsx
        │   └── WaitList.tsx
        └── pages/
            ├── StationPage.tsx  # QR-Code Scan-Seite (mobil)
            └── QRCodesPage.tsx  # Druckansicht QR-Codes
```
