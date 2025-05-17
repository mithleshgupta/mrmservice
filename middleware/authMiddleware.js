const jwt = require('jsonwebtoken');
const JWT_SECRET = 'Mz/kaTPVSeIBcO8xSa31o7dUBtOeOx85bUNZIe/faEDBwHhU6scgW331h7DnUqUrYNOiyPFpzq6bPGslppw1UQ==';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token is required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
}

module.exports = authenticateToken;