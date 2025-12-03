const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Cart = require("./cart");
const Product = require("./product");

const CartItem = sequelize.define("CartItem", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false,
  },
  // Chức năng: Chọn sản phẩm để thanh toán
  isSelected: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

// Quan hệ
Cart.hasMany(CartItem, { foreignKey: "cartId" });
CartItem.belongsTo(Cart, { foreignKey: "cartId" });

Product.hasMany(CartItem, { foreignKey: "productId" });
CartItem.belongsTo(Product, { foreignKey: "productId" });

// Đồng bộ database (lưu ý: chỉ dùng trong dev, production nên dùng migration)
(async () => {
  await Cart.sync();
  await CartItem.sync();
})();

module.exports = CartItem;
