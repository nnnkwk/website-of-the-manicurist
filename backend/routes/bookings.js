const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const router = express.Router();
const DATA_FILE = path.join(__dirname, '..', 'data', 'bookings.json');

function readBookings() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const raw = fs.readFileSync(DATA_FILE, 'utf-8').trim();
  return raw ? JSON.parse(raw) : [];
}

function writeBookings(bookings) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2), 'utf-8');
}

// POST /api/bookings — создать заявку на запись
router.post('/', (req, res) => {
  const { name, phone, service, date, comment } = req.body || {};

  if (!name || !name.trim() || !phone || !phone.trim()) {
    return res.status(400).json({ message: 'Укажите имя и телефон' });
  }

  const booking = {
    id: crypto.randomUUID(),
    name: name.trim(),
    phone: phone.trim(),
    service: service || '',
    date: date || '',
    comment: comment || '',
    createdAt: new Date().toISOString(),
    status: 'new'
  };

  const bookings = readBookings();
  bookings.push(booking);
  writeBookings(bookings);

  res.status(201).json({ message: 'Заявка принята', booking });
});

// GET /api/bookings — список заявок (для админки), требует токен
router.get('/', (req, res) => {
  const token = req.header('x-admin-token');
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ message: 'Нет доступа' });
  }
  res.json(readBookings());
});

module.exports = router;
