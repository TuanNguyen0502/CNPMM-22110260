const {
  getProductWithPagination,
  createProductService,
  updateProductService,
  deleteProductService,
} = require("../services/productService");

const getProducts = async (req, res) => {
  // Lấy tham số từ query string: ?page=1&limit=5&category=abc
  let page = +req.query.page || 1;
  let limit = +req.query.limit || 5;
  let category = req.query.category || "ALL";

  let data = await getProductWithPagination(page, limit, category);
  return res.status(200).json(data);
};

const handleCreateProduct = async (req, res) => {
  const { name, price, category, image } = req.body;
  const data = await createProductService({ name, price, category, image });
  return res.status(200).json(data);
};

const handleUpdateProduct = async (req, res) => {
  const { id, name, price, category, image } = req.body;
  const data = await updateProductService({ id, name, price, category, image });
  return res.status(200).json(data);
};

const handleDeleteProduct = async (req, res) => {
  const { id } = req.params;
  const data = await deleteProductService(id);
  return res.status(200).json(data);
};

module.exports = {
  getProducts,
  handleCreateProduct,
  handleUpdateProduct,
  handleDeleteProduct,
};
