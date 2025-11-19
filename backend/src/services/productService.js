const Product = require("../models/product");
const { Op } = require("sequelize");

const getProductWithPagination = async (page, limit, category) => {
  try {
    let offset = (page - 1) * limit;
    let whereClause = {};

    // Nếu có category gửi lên thì lọc, không thì lấy hết
    if (category && category !== "ALL") {
      whereClause.category = category;
    }

    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      offset: offset,
      limit: limit,
      order: [["createdAt", "DESC"]], // Sản phẩm mới nhất lên đầu
    });

    return {
      EC: 0,
      data: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
      page: page,
      limit: limit,
    };
  } catch (error) {
    console.log(error);
    return {
      EC: 1,
      EM: "Something wrongs with services",
      data: [],
    };
  }
};

module.exports = {
  getProductWithPagination,
};
