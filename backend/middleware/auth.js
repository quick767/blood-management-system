const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Token is not valid. User not found.' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Account is deactivated. Please contact administrator.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token is not valid.' 
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token has expired.' 
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Server error during authentication.' 
    });
  }
};

// Check if user has admin role
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Access denied. Admin privileges required.' 
    });
  }
  next();
};

// Check if user has donor role
const donorAuth = (req, res, next) => {
  if (req.user.role !== 'donor' && req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Access denied. Donor privileges required.' 
    });
  }
  next();
};

// Check if user can access resource (own resource or admin)
const resourceAuth = (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId || req.query.userId;
  
  if (req.user.role === 'admin' || req.user._id.toString() === resourceUserId) {
    return next();
  }
  
  return res.status(403).json({ 
    message: 'Access denied. You can only access your own resources.' 
  });
};

// Optional auth - doesn't fail if no token provided
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

// Rate limiting middleware
const createRateLimiter = (windowMs, max, message) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const key = req.ip + (req.user ? req.user._id : '');
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old requests
    if (requests.has(key)) {
      requests.set(key, requests.get(key).filter(time => time > windowStart));
    } else {
      requests.set(key, []);
    }
    
    const userRequests = requests.get(key);
    
    if (userRequests.length >= max) {
      return res.status(429).json({ 
        message: message || 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    userRequests.push(now);
    next();
  };
};

// Specific rate limiters
const loginRateLimit = createRateLimiter(15 * 60 * 1000, 5, 'Too many login attempts. Please try again in 15 minutes.');
const registerRateLimit = createRateLimiter(60 * 60 * 1000, 3, 'Too many registration attempts. Please try again in 1 hour.');
const requestRateLimit = createRateLimiter(60 * 60 * 1000, 10, 'Too many requests. Please try again in 1 hour.');

module.exports = {
  auth,
  adminAuth,
  donorAuth,
  resourceAuth,
  optionalAuth,
  loginRateLimit,
  registerRateLimit,
  requestRateLimit
};

