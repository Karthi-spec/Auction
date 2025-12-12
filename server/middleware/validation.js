const Joi = require('joi');

// Validation schemas
const bidSchema = Joi.object({
  sessionId: Joi.number().integer().positive().required(),
  playerId: Joi.number().integer().positive().required(),
  teamName: Joi.string().min(1).max(100).required(),
  amount: Joi.number().integer().min(1).max(1000000000).required(),
  bidType: Joi.string().valid('normal', 'rtm').default('normal')
});

const auctionActionSchema = Joi.object({
  sessionId: Joi.number().integer().positive().required(),
  playerId: Joi.number().integer().positive().required(),
  teamName: Joi.string().min(1).max(100).optional(),
  amount: Joi.number().integer().min(1).max(1000000000).optional()
});

const playerSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  team: Joi.string().max(100).optional(),
  role: Joi.string().valid('Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper').required(),
  battingStyle: Joi.string().max(50).optional(),
  bowlingStyle: Joi.string().max(50).optional(),
  basePrice: Joi.number().integer().min(1).max(1000000000).required(),
  photoUrl: Joi.string().uri().optional(),
  videoUrl: Joi.string().uri().optional(),
  ratingBatting: Joi.number().integer().min(0).max(100).default(50),
  ratingBowling: Joi.number().integer().min(0).max(100).default(50),
  ratingFielding: Joi.number().integer().min(0).max(100).default(50),
  ratingOverall: Joi.number().integer().min(0).max(100).default(50)
});

// Middleware functions
const validateBid = (req, res, next) => {
  const { error, value } = bidSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }
  
  req.body = value;
  next();
};

const validateAuctionAction = (req, res, next) => {
  const { error, value } = auctionActionSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }
  
  req.body = value;
  next();
};

const validatePlayer = (req, res, next) => {
  const { error, value } = playerSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }
  
  req.body = value;
  next();
};

// Rate limiting for sensitive operations
const createRateLimit = (windowMs, max, message) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    
    if (!requests.has(key)) {
      requests.set(key, []);
    }
    
    const userRequests = requests.get(key);
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < windowMs);
    requests.set(key, validRequests);
    
    if (validRequests.length >= max) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: message || 'Too many requests, please try again later'
      });
    }
    
    validRequests.push(now);
    next();
  };
};

// Specific rate limits
const bidRateLimit = createRateLimit(
  60 * 1000, // 1 minute
  10, // 10 bids per minute
  'Too many bids, please slow down'
);

const adminActionRateLimit = createRateLimit(
  60 * 1000, // 1 minute
  30, // 30 actions per minute
  'Too many admin actions, please slow down'
);

// Input sanitization
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove potentially dangerous characters
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };
  
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  
  next();
};

// Authentication middleware (basic implementation)
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required' });
  }
  
  const token = authHeader.split(' ')[1];
  
  // In production, implement proper JWT verification
  if (token === 'admin-token-123') {
    req.user = { role: 'admin' };
    next();
  } else {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

module.exports = {
  validateBid,
  validateAuctionAction,
  validatePlayer,
  bidRateLimit,
  adminActionRateLimit,
  sanitizeInput,
  authenticateAdmin
};