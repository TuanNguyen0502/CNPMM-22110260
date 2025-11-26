const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 10000, // 100 in production, 10000 in development
  message: {
    message:
      process.env.NODE_ENV === "production"
        ? "Too many requests from this IP, please try again after 15 minutes"
        : "API rate limit exceeded during development",
  },
  standardHeaders: true, // Tạo header `RateLimit-*`
  legacyHeaders: false, // Tắt header `X-RateLimit-*`
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 5 : 1000, // 5 in production, 1000 in development
  message: {
    message:
      process.env.NODE_ENV === "production"
        ? "Too many login attempts from this IP, please try again after 15 minutes"
        : "Rate limit exceeded during development",
  },
});

module.exports = { apiLimiter, loginLimiter };
