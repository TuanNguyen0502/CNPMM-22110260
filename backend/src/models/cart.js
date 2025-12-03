const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./user");

const Cart = sequelize.define("Cart", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // Trạng thái giỏ hàng (Active, Completed...) - tuỳ chọn
  status: {
    type: DataTypes.STRING,
    defaultValue: "active",
  },
});

// Thiết lập quan hệ: 1 User có 1 Cart
User.hasOne(Cart, { foreignKey: "userId" });
Cart.belongsTo(User, { foreignKey: "userId" });

module.exports = Cart;
