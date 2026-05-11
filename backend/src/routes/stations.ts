import { Router, Request, Response } from 'express';
import db from '../db';

const router = Router();

// GET /api/stations - all stations with active session info
router.get('/', (_req: Request, res: Response) => {
  const stations = db.prepare(`
    SELECT 
      s.id,
      s.name,
      s.location,
      s.status,
      sess.id as session_id,
      sess.user_name,
      sess.car_plate,
      sess.start_time
    FROM stations s
    LEFT JOIN sessions sess ON sess.station_id = s.id AND sess.end_time IS NULL
    ORDER BY s.id
  `).all();
  res.json(stations);
});

// GET /api/stations/:id - single station
router.get('/:id', (req: Request, res: Response) => {
  const station = db.prepare(`
    SELECT 
      s.id,
      s.name,
      s.location,
      s.status,
      sess.id as session_id,
      sess.user_name,
      sess.car_plate,
      sess.start_time
    FROM stations s
    LEFT JOIN sessions sess ON sess.station_id = s.id AND sess.end_time IS NULL
    WHERE s.id = ?
  `).get(req.params.id);

  if (!station) {
    return res.status(404).json({ error: 'Station nicht gefunden' });
  }
  return res.json(station);
});

// POST /api/stations/:id/checkin - check in to a station
router.post('/:id/checkin', (req: Request, res: Response) => {
  const { user_name, car_plate } = req.body;
  if (!user_name || !car_plate) {
    return res.status(400).json({ error: 'Name und Kennzeichen erforderlich' });
  }

  const station = db.prepare('SELECT * FROM stations WHERE id = ?').get(req.params.id) as { id: number; status: string } | undefined;
  if (!station) {
    return res.status(404).json({ error: 'Station nicht gefunden' });
  }
  if (station.status !== 'available') {
    return res.status(409).json({ error: 'Station ist nicht verfügbar' });
  }

  const updateStation = db.prepare("UPDATE stations SET status = 'occupied' WHERE id = ?");
  const insertSession = db.prepare(
    'INSERT INTO sessions (station_id, user_name, car_plate) VALUES (?, ?, ?)'
  );

  const tx = db.transaction(() => {
    updateStation.run(req.params.id);
    const result = insertSession.run(req.params.id, user_name, car_plate);
    return result.lastInsertRowid;
  });

  const sessionId = tx();
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
  return res.status(201).json({ message: 'Ladevorgang gestartet', session });
});

// POST /api/stations/:id/checkout - check out from a station
router.post('/:id/checkout', (req: Request, res: Response) => {
  const station = db.prepare('SELECT * FROM stations WHERE id = ?').get(req.params.id) as { id: number; status: string } | undefined;
  if (!station) {
    return res.status(404).json({ error: 'Station nicht gefunden' });
  }
  if (station.status !== 'occupied') {
    return res.status(409).json({ error: 'Station ist nicht belegt' });
  }

  const updateStation = db.prepare("UPDATE stations SET status = 'available' WHERE id = ?");
  const endSession = db.prepare(
    "UPDATE sessions SET end_time = datetime('now', 'localtime') WHERE station_id = ? AND end_time IS NULL"
  );

  // Check if there is a waitlist entry to notify
  const nextWaiting = db.prepare(
    'SELECT * FROM waitlist WHERE notified = 0 ORDER BY added_time ASC LIMIT 1'
  ).get() as { id: number; user_name: string; car_plate: string } | undefined;

  const tx = db.transaction(() => {
    updateStation.run(req.params.id);
    endSession.run(req.params.id);
    if (nextWaiting) {
      db.prepare('UPDATE waitlist SET notified = 1 WHERE id = ?').run(nextWaiting.id);
    }
  });

  tx();

  return res.json({
    message: 'Ladevorgang beendet',
    notified: nextWaiting
      ? { id: nextWaiting.id, user_name: nextWaiting.user_name }
      : null,
  });
});

// PATCH /api/stations/:id/status - set offline/available manually
router.patch('/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  const validStatuses = ['available', 'offline'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Ungültiger Status' });
  }

  const station = db.prepare('SELECT * FROM stations WHERE id = ?').get(req.params.id) as { id: number; status: string } | undefined;
  if (!station) {
    return res.status(404).json({ error: 'Station nicht gefunden' });
  }
  if (station.status === 'occupied' && status === 'offline') {
    return res.status(409).json({ error: 'Station ist belegt – bitte erst abmelden' });
  }

  db.prepare('UPDATE stations SET status = ? WHERE id = ?').run(status, req.params.id);
  return res.json({ message: 'Status aktualisiert' });
});

export default router;
