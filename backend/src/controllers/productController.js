const {
  getProductWithPagination,
  createProductService,
  updateProductService,
  deleteProductService,
  searchProductsService,
  syncProductsToES,

  getSimilarProductsService,
  getProductStatsService,
  toggleFavoriteService,
  getFavoritesService,
} = require("../services/productService");
const { recreateProductsIndex } = require("../config/elasticsearch");

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

const handleRecreateIndex = async (req, res) => {
  const result = await recreateProductsIndex();

  if (result.success) {
    // After recreating index, sync all products
    const syncResult = await syncProductsToES();
    return res.status(200).json({
      EC: 0,
      EM: `${result.message}. ${
        syncResult.EM || "Products synced successfully"
      }`,
    });
  } else {
    return res.status(500).json({
      EC: 1,
      EM: result.message,
    });
  }
};

const handleGetSimilarProducts = async (req, res) => {
  const { id } = req.params;
  const data = await getSimilarProductsService(id);
  return res.status(200).json(data);
};

const handleGetProductStats = async (req, res) => {
  const { id } = req.params;
  const data = await getProductStatsService(id);
  return res.status(200).json(data);
};

const handleToggleFavorite = async (req, res) => {
  const { productId } = req.body;
  const User = require("../models/user");
  const user = await User.findOne({ where: { email: req.user.email } });

  if (!user) return res.status(401).json({ EC: 1, EM: "User not found" });

  const data = await toggleFavoriteService(user.id, productId);
  return res.status(200).json(data);
};

const handleGetFavorites = async (req, res) => {
  const User = require("../models/user");
  const user = await User.findOne({ where: { email: req.user.email } });
  if (!user) return res.status(401).json({ EC: 1, EM: "User not found" });

  const data = await getFavoritesService(user.id);
  return res.status(200).json(data);
};

module.exports = {
  getProducts,
  handleCreateProduct,
  handleUpdateProduct,
  handleDeleteProduct,
  handleSearchProducts,
  handleSyncProducts,
  handleRecreateIndex,

  handleGetSimilarProducts,
  handleGetProductStats,
  handleToggleFavorite,
  handleGetFavorites,
};
