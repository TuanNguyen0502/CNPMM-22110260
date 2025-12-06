const { createOrderService } = require("../services/orderService");
const User = require("../models/user");

const handlePlaceOrder = async (req, res) => {
  // Lấy thông tin người nhận từ client gửi lên
  const { name, address, phone } = req.body;

  // Lấy user từ token
  // Query lại DB để chắc chắn lấy đúng ID
  const user = await User.findOne({ where: { email: req.user.email } });

  // Kiểm tra user tồn tại
  if (!user) return res.status(401).json({ EC: 1, EM: "User not found" });

  // Gọi service tạo đơn hàng
  const result = await createOrderService(user, { name, address, phone });

  // Trả về kết quả cho client
  return res.status(200).json(result);
};

module.exports = { handlePlaceOrder };
