export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function getBearerToken(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  return token || null;
}

export function httpError(status, message, details) {
  const err = new Error(message);
  err.status = status;
  err.details = details;
  return err;
}

export function sendError(res, err) {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    details: err.details || undefined,
  });
}

export function parseNumber(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function parseDateOnly(v) {
  if (!v) return null;
  // Expect YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  return v;
}
