const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Note: ensure the token string format is handled (Bearer <token>)
    const tokenString = token.startsWith('Bearer ') ? token.slice(7) : token;
    
    const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
    req.user = decoded; // Attach full user payload
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
