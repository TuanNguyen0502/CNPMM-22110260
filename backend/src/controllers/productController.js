const { getProductWithPagination } = require("../services/productService");

const getProducts = async (req, res) => {
  // Lấy tham số từ query string: ?page=1&limit=5&category=abc
  let page = +req.query.page || 1;
  let limit = +req.query.limit || 5;
  let category = req.query.category || "ALL";

  let data = await getProductWithPagination(page, limit, category);
  return res.status(200).json(data);
};

module.exports = {
  getProducts,
};
