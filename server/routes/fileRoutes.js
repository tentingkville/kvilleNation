// server/routes/fileRoutes.js
const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function makeStorage(basename) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || '.pdf';
      cb(null, `${basename}${ext}`);
    },
  });
}

const uploadPolicy   = multer({ storage: makeStorage('policy'),   limits: { fileSize: 15 * 1024 * 1024 } });
const uploadCalendar = multer({ storage: makeStorage('calendar'), limits: { fileSize: 15 * 1024 * 1024 } });

// ---- POLICY ----
router.get('/policy', (_req, res) => {
  const files = fs.readdirSync(UPLOAD_DIR);
  const name = files.find(f => f.startsWith('policy.'));
  if (!name) return res.json({ url: null, updatedAt: null });
  const stat = fs.statSync(path.join(UPLOAD_DIR, name));
  return res.json({ url: `/uploads/${name}`, updatedAt: stat.mtime });
});

router.post('/policy', uploadPolicy.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  return res.json({ url: `/uploads/${req.file.filename}`, size: req.file.size, mimetype: req.file.mimetype });
});

// ---- CALENDAR ----
router.get('/calendar', (_req, res) => {
  const files = fs.readdirSync(UPLOAD_DIR);
  const name = files.find(f => f.startsWith('calendar.'));
  if (!name) return res.json({ url: null, updatedAt: null });
  const stat = fs.statSync(path.join(UPLOAD_DIR, name));
  return res.json({ url: `/uploads/${name}`, updatedAt: stat.mtime });
});

router.post('/calendar', uploadCalendar.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  return res.json({ url: `/uploads/${req.file.filename}`, size: req.file.size, mimetype: req.file.mimetype });
});

module.exports = router;