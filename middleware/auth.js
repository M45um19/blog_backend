const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ msg: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, isAdmin }
    next();
  } catch (err) {
    return res.status(403).json({ msg: 'Invalid token' });
  }
}

function isAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) return res.status(403).json({ msg: 'Admins only' });
  next();
}

module.exports = { verifyToken, isAdmin };
