const express = require("express");
const { validate } = require("express-validation");

const {
  createUser,
  handleLogin,
  getUser,
  getAccount,
} = require("../controllers/userController");
const {
  getProducts,
  handleCreateProduct,
  handleUpdateProduct,
  handleDeleteProduct,
} = require("../controllers/productController");

const auth = require("../middleware/auth");
const delay = require("../middleware/delay");
const {
  registerValidation,
  loginValidation,
} = require("../middleware/validation");
const { apiLimiter, loginLimiter } = require("../middleware/limiter");
const { checkAdmin } = require("../middleware/role");

const routerAPI = express.Router();

// 1. Áp dụng Authentication cho toàn bộ router (trừ whitelist định nghĩa trong auth.js)
routerAPI.use(auth);

// 2. Áp dụng Rate Limiting chung cho toàn bộ API (Tuỳ chọn)
routerAPI.use(apiLimiter);

routerAPI.get("/", (req, res) => {
  return res.status(200).json({ message: "API is working" });
});

// API Đăng ký: Thêm Validation
routerAPI.post("/register", validate(registerValidation, {}, {}), createUser);

// API Đăng nhập: Thêm Validation + Rate Limiting
routerAPI.post(
  "/login",
  loginLimiter,
  validate(loginValidation, {}, {}),
  handleLogin
);

// API User: Thêm Authorization (Chỉ Admin mới xem được danh sách user)
routerAPI.get("/user", checkAdmin, getUser);

routerAPI.get("/account", delay, getAccount);

// Route này nằm sau middleware 'auth' và không thuộc whitelist, nên bắt buộc phải đăng nhập mới gọi được.
routerAPI.get("/products", getProducts);

routerAPI.post("/products", checkAdmin, handleCreateProduct);
routerAPI.put("/products", checkAdmin, handleUpdateProduct);
routerAPI.delete("/products/:id", checkAdmin, handleDeleteProduct);

module.exports = routerAPI;
