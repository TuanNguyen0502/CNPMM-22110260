require("dotenv").config();
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const white_lists = ["/", "/register", "/login"];
  if (white_lists.find((item) => "/v1/api" + item === req.originalUrl)) {
    next();
  } else {
    if (req?.headers?.authorization?.split(" ")?.[1]) {
      const token = req.headers.authorization.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
          email: decoded.email,
          name: decoded.name,
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
