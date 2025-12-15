const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const streamifier = require('streamifier');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

// Use a dedicated bucket name (creates collections: uploads.files + uploads.chunks)
function getBucket() {
  const db = mongoose.connection.db;
  if (!db) throw new Error('MongoDB not connected yet.');
  return new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });
}

async function findLatestByKind(kind) {
  const db = mongoose.connection.db;
  const files = await db
    .collection('uploads.files')
    .find({ 'metadata.kind': kind })
    .sort({ uploadDate: -1 })
    .limit(1)
    .toArray();
  return files[0] || null;
}

async function deleteAllByKind(kind) {
  const db = mongoose.connection.db;
  const bucket = getBucket();

  const files = await db.collection('uploads.files').find({ 'metadata.kind': kind }).toArray();
  // Delete each file (also removes its chunks)
  await Promise.all(files.map((f) => bucket.delete(f._id).catch(() => {})));
}

async function uploadNew(kind, file) {
  const bucket = getBucket();

  // Keep a stable name in Mongo (helpful for debugging)
  const filename = `${kind}.pdf`;

  // Upload stream into GridFS
  const uploadStream = bucket.openUploadStream(filename, {
    contentType: file.mimetype || 'application/pdf',
    metadata: {
      kind, // "policy" or "calendar"
      originalName: file.originalname,
    },
  });

  await new Promise((resolve, reject) => {
    streamifier
      .createReadStream(file.buffer)
      .pipe(uploadStream)
      .on('error', reject)
      .on('finish', resolve);
  });

  return uploadStream.id;
}

// ------------------- POLICY META -------------------
router.get('/policy', async (_req, res) => {
  try {
    const latest = await findLatestByKind('policy');
    if (!latest) return res.json({ url: null, updatedAt: null });

    // Cache-bust using uploadDate timestamp
    const v = new Date(latest.uploadDate).getTime();

    return res.json({
      url: `/api/files/policy/download?v=${v}`,
      updatedAt: latest.uploadDate,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Failed to fetch policy metadata' });
  }
});

// ------------------- POLICY DOWNLOAD -------------------
router.get('/policy/download', async (_req, res) => {
  try {
    const latest = await findLatestByKind('policy');
    if (!latest) return res.status(404).send('No policy file');

    res.setHeader('Content-Type', latest.contentType || 'application/pdf');
    res.setHeader('Cache-Control', 'no-store');
    // inline = open in browser; attachment = force download
    res.setHeader('Content-Disposition', 'inline; filename="policy.pdf"');

    const bucket = getBucket();
    bucket.openDownloadStream(latest._id).pipe(res);
  } catch (e) {
    return res.status(500).send(e.message || 'Failed to download policy');
  }
});

// ------------------- POLICY UPLOAD -------------------
router.post('/policy', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // Replace the current policy
    await deleteAllByKind('policy');
    await uploadNew('policy', req.file);

    return res.json({ ok: true, message: 'Policy uploaded' });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Upload failed' });
  }
});

// ------------------- CALENDAR META -------------------
router.get('/calendar', async (_req, res) => {
  try {
    const latest = await findLatestByKind('calendar');
    if (!latest) return res.json({ url: null, updatedAt: null });

    const v = new Date(latest.uploadDate).getTime();

    return res.json({
      url: `/api/files/calendar/download?v=${v}`,
      updatedAt: latest.uploadDate,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Failed to fetch calendar metadata' });
  }
});

// ------------------- CALENDAR DOWNLOAD -------------------
router.get('/calendar/download', async (_req, res) => {
  try {
    const latest = await findLatestByKind('calendar');
    if (!latest) return res.status(404).send('No calendar file');

    res.setHeader('Content-Type', latest.contentType || 'application/pdf');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Disposition', 'inline; filename="calendar.pdf"');

    const bucket = getBucket();
    bucket.openDownloadStream(latest._id).pipe(res);
  } catch (e) {
    return res.status(500).send(e.message || 'Failed to download calendar');
  }
});

// ------------------- CALENDAR UPLOAD -------------------
router.post('/calendar', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    await deleteAllByKind('calendar');
    await uploadNew('calendar', req.file);

    return res.json({ ok: true, message: 'Calendar uploaded' });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Upload failed' });
  }
});

module.exports = router;