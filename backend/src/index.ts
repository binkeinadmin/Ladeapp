import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import QRCode from 'qrcode';
import stationsRouter from './routes/stations';
import waitlistRouter from './routes/waitlist';

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({ origin: '*' }));
app.use(express.json());

// API routes
app.use('/api/stations', stationsRouter);
app.use('/api/waitlist', waitlistRouter);

// QR code for a station → returns SVG data URL
app.get('/api/qr/:id', async (req: Request, res: Response) => {
  const stationId = req.params.id;
  const stationUrl = `${FRONTEND_URL}/station/${stationId}`;
  try {
    const dataUrl = await QRCode.toDataURL(stationUrl, {
      errorCorrectionLevel: 'M',
      width: 300,
      margin: 2,
    });
    res.json({ stationId, url: stationUrl, qrCode: dataUrl });
  } catch {
    res.status(500).json({ error: 'QR-Code konnte nicht erstellt werden' });
  }
});

// SSE endpoint – clients subscribe and get push notifications on changes
const clients: Set<Response> = new Set();

app.get('/api/events', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.add(res);

  // Heartbeat every 30 s
  const heartbeat = setInterval(() => {
    res.write('event: ping\ndata: {}\n\n');
  }, 30000);

  res.on('close', () => {
    clearInterval(heartbeat);
    clients.delete(res);
  });
});

export function broadcast(event: string, data: unknown): void {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  clients.forEach((client) => client.write(payload));
}

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', clients: clients.size });
});

// Serve built frontend in production
const FRONTEND_DIST = path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(FRONTEND_DIST));
app.get('*', (_req: Request, res: Response) => {
  const indexPath = path.join(FRONTEND_DIST, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) res.status(200).send('Ladeapp Backend läuft');
  });
});

app.listen(PORT, () => {
  console.log(`Ladeapp Backend läuft auf Port ${PORT}`);
});

export default app;
