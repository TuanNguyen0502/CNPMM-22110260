const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database"); // Import sequelize instance từ config

// Định nghĩa model 'User'
const User = sequelize.define(
  "User",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: true, // Cho phép null giống file PDF
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true, // Đảm bảo email là duy nhất
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "User", // Giá trị mặc định
    },
  },
  {
    tableName: "users", // Tên bảng trong MySQL
  }
);

// Tự động tạo bảng nếu chưa tồn tại
// (Trong dự án thực tế, nên dùng Migrations)
(async () => {
  await User.sync();
  console.log("User table synced");
})();

module.exports = User;
