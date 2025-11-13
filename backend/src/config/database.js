require("dotenv").config();
const { Sequelize } = require("sequelize");

// Khởi tạo một đối tượng Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
  }
);

// Hàm kiểm tra kết nối
const connection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to database");
  } catch (error) {
    console.error(">>> Error connect to DB:", error);
  }
};

// Export sequelize instance và hàm connection
module.exports = { sequelize, connection };
