require("dotenv").config();
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  // White list URLs that do not require authentication
  const white_lists = ["/", "/register", "/login"];
  // Check if the request URL is in the white list
  if (white_lists.find((item) => "/v1/api" + item === req.originalUrl)) {
    // Bypass authentication for white list URLs
    next();
  } else {
    // Check for the presence of the Authorization header
    if (req?.headers?.authorization?.split(" ")?.[1]) {
      // Extract and verify the JWT token
      const token = req.headers.authorization.split(" ")[1];
      try {
        // Verify the token and extract user information
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach user information to the request object
        req.user = {
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
          createdBy: "Nguyen Ha Hong Tuan",
        };
        next();
      } catch (err) {
        return res.status(401).json({ message: "Invalid Token" });
      }
    } else {
      return res.status(401).json({ message: "No Token Provided" });
    }
  }
};

module.exports = auth;
