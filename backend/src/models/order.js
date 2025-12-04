const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Product = require("./product");

const Order = sequelize.define("Order", {
  status: { type: DataTypes.STRING, defaultValue: "pending" }, // pending, completed, cancelled
  totalPrice: { type: DataTypes.INTEGER, defaultValue: 0 },
  userId: { type: DataTypes.INTEGER },

  receiverName: { type: DataTypes.STRING, allowNull: false },
  receiverPhone: { type: DataTypes.STRING, allowNull: false },
  receiverAddress: { type: DataTypes.STRING, allowNull: false },
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
  await Order.sync({ alter: true });
  await OrderItem.sync({ alter: true });
})();

module.exports = { Order, OrderItem };
