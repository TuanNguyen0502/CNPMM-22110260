const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Product = require("./product");

const Order = sequelize.define("Order", {
  status: { type: DataTypes.STRING, defaultValue: "pending" }, // pending, completed
  totalPrice: { type: DataTypes.INTEGER },
  userId: { type: DataTypes.INTEGER },
});

const OrderItem = sequelize.define("OrderItem", {
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.INTEGER, allowNull: false },
});

Order.hasMany(OrderItem, { foreignKey: "orderId" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });
Product.hasMany(OrderItem, { foreignKey: "productId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });

(async () => {
  await Order.sync();
  await OrderItem.sync();
})();

module.exports = { Order, OrderItem };
