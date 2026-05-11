import { Router, Request, Response } from 'express';
import db from '../db';

const router = Router();

// GET /api/waitlist
router.get('/', (_req: Request, res: Response) => {
  const list = db.prepare(
    'SELECT * FROM waitlist ORDER BY added_time ASC'
  ).all();
  res.json(list);
});

// POST /api/waitlist - add to waitlist
router.post('/', (req: Request, res: Response) => {
  const { user_name, car_plate, phone } = req.body;
  if (!user_name || !car_plate) {
    return res.status(400).json({ error: 'Name und Kennzeichen erforderlich' });
  }

  const result = db.prepare(
    'INSERT INTO waitlist (user_name, car_plate, phone) VALUES (?, ?, ?)'
  ).run(user_name, car_plate, phone || null);

  const entry = db.prepare('SELECT * FROM waitlist WHERE id = ?').get(result.lastInsertRowid);
  return res.status(201).json(entry);
});

// DELETE /api/waitlist/:id - remove from waitlist
router.delete('/:id', (req: Request, res: Response) => {
  const entry = db.prepare('SELECT * FROM waitlist WHERE id = ?').get(req.params.id);
  if (!entry) {
    return res.status(404).json({ error: 'Eintrag nicht gefunden' });
  }
  db.prepare('DELETE FROM waitlist WHERE id = ?').run(req.params.id);
  return res.json({ message: 'Aus Warteliste entfernt' });
});

// DELETE /api/waitlist - clear all notified entries
router.delete('/', (_req: Request, res: Response) => {
  db.prepare('DELETE FROM waitlist WHERE notified = 1').run();
  res.json({ message: 'Benachrichtigte Einträge entfernt' });
});

export default router;
