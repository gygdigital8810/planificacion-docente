const crypto = require('node:crypto');
const cookieName = 'coord_session';
const equal = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
const sign = value => crypto.createHmac('sha256', process.env.SESSION_SECRET).update(value).digest('hex');
function valid(req) {
  const cookie = (req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith(cookieName + '='));
  if (!cookie) return false;
  const [expiry, mac] = cookie.slice(cookieName.length + 1).split('.');
  return Boolean(expiry && mac && Number(expiry) > Date.now() && equal(mac, sign(expiry)));
}
module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!process.env.COORDINATOR_PASSWORD || !process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) return res.status(503).json({ error: 'Falta configurar el acceso de coordinación en el servidor.' });
  if (req.method === 'GET') return res.status(200).json({ authenticated: valid(req) });
  if (req.method === 'DELETE') { res.setHeader('Set-Cookie', `${cookieName}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`); return res.status(200).json({ authenticated: false }); }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido.' });
  const { username, password } = req.body || {};
  if (!equal(username || '', 'gersson') || !equal(password || '', process.env.COORDINATOR_PASSWORD)) return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
  const expiry = String(Date.now() + 8 * 60 * 60 * 1000);
  res.setHeader('Set-Cookie', `${cookieName}=${expiry}.${sign(expiry)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`);
  return res.status(200).json({ authenticated: true });
};
