const checkAdmin = (req, res, next) => {
  // req.user đã được tạo ra từ middleware auth.js
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role === "Admin") {
    next(); // Nếu là Admin thì cho đi tiếp
  } else {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }
};

module.exports = { checkAdmin };
