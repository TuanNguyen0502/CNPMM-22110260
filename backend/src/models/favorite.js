const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./user");
const Product = require("./product");

const Favorite = sequelize.define("Favorite", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
});

User.belongsToMany(Product, { through: Favorite, foreignKey: "userId" });
Product.belongsToMany(User, { through: Favorite, foreignKey: "productId" });

(async () => {
  await Favorite.sync();
})();

module.exports = Favorite;
