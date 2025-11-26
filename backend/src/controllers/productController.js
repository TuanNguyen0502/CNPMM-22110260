const {
  getProductWithPagination,
  createProductService,
  updateProductService,
  deleteProductService,
  searchProductsService,
  syncProductsToES,
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

const handleSearchProducts = async (req, res) => {
  // Get search parameters from query string: ?q=phone&page=1&limit=10&category=Electronics&minPrice=100&maxPrice=1000
  let query = req.query.q || "";
  let page = +req.query.page || 1;
  let limit = +req.query.limit || 10;
  let category = req.query.category;
  let minPrice = req.query.minPrice ? +req.query.minPrice : undefined;
  let maxPrice = req.query.maxPrice ? +req.query.maxPrice : undefined;

  const data = await searchProductsService(
    query,
    page,
    limit,
    category,
    minPrice,
    maxPrice
  );
  return res.status(200).json(data);
};

const handleSyncProducts = async (req, res) => {
  const data = await syncProductsToES();
  return res.status(200).json(data);
};

module.exports = {
  getProducts,
  handleCreateProduct,
  handleUpdateProduct,
  handleDeleteProduct,
  handleSearchProducts,
  handleSyncProducts,
};
