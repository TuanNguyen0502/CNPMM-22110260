const Product = require("../models/product");
const { Op } = require("sequelize");
const { client, PRODUCTS_INDEX } = require("../config/elasticsearch");

const Favorite = require("../models/favorite");
const Review = require("../models/review");
const { OrderItem } = require("../models/order");
const User = require("../models/user");

// Helper function to index a product to Elasticsearch
const indexProductToES = async (product) => {
  try {
    await client.index({
      index: PRODUCTS_INDEX,
      id: product.id,
      document: {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        image: product.image,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    });
    console.log(`Indexed product ${product.id} to Elasticsearch`);
  } catch (error) {
    console.error("Error indexing product to Elasticsearch:", error);
  }
};

// Helper function to remove a product from Elasticsearch
const removeProductFromES = async (productId) => {
  try {
    await client.delete({
      index: PRODUCTS_INDEX,
      id: productId,
    });
    console.log(`Removed product ${productId} from Elasticsearch`);
  } catch (error) {
    console.error("Error removing product from Elasticsearch:", error);
  }
};

// Search products using Elasticsearch with filters
const searchProductsService = async (
  query,
  page = 1,
  limit = 10,
  category,
  minPrice,
  maxPrice
) => {
  try {
    let offset = (page - 1) * limit;

    // Build Elasticsearch query
    let esQuery = {
      bool: {
        must: [],
        filter: [],
      },
    };

    // Add text search if query is provided
    if (query && query.trim() !== "") {
      esQuery.bool.must.push({
        multi_match: {
          query: query,
          fields: ["name^2", "category"], // Boost name field
          type: "best_fields",
          fuzziness: "AUTO",
        },
      });
    } else {
      // If no search query, match all documents
      esQuery.bool.must.push({
        match_all: {},
      });
    }

    // Add category filter
    if (category && category !== "ALL") {
      esQuery.bool.filter.push({
        term: {
          category: category,
        },
      });
    }

    // Add price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      let priceFilter = {
        range: {
          price: {},
        },
      };

      if (minPrice !== undefined) {
        priceFilter.range.price.gte = minPrice;
      }

      if (maxPrice !== undefined) {
        priceFilter.range.price.lte = maxPrice;
      }

      esQuery.bool.filter.push(priceFilter);
    }

    // Execute search
    const searchResult = await client.search({
      index: PRODUCTS_INDEX,
      query: esQuery,
      from: offset,
      size: limit,
      sort: [{ createdAt: { order: "desc" } }],
    });

    const hits = searchResult.hits;
    const products = hits.hits.map((hit) => hit._source);
    const total = hits.total.value;

    return {
      EC: 0,
      data: products,
      total: total,
      totalPages: Math.ceil(total / limit),
      page: page,
      limit: limit,
      query: query,
    };
  } catch (error) {
    console.error("Error searching products:", error);
    return {
      EC: 1,
      EM: "Error searching products",
      data: [],
    };
  }
};

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

const createProductService = async (data) => {
  try {
    let newProduct = await Product.create({
      name: data.name,
      price: data.price,
      category: data.category,
      image: data.image,
    });

    // Index the new product to Elasticsearch
    await indexProductToES(newProduct);

    return {
      EC: 0,
      data: newProduct,
    };
  } catch (error) {
    console.log(error);
    return {
      EC: 1,
      EM: "Create product failed",
    };
  }
};

const updateProductService = async (data) => {
  try {
    if (!data.id) {
      return {
        EC: 1,
        EM: "Missing required params",
      };
    }
    let product = await Product.findOne({ where: { id: data.id } });
    if (product) {
      await product.update({
        name: data.name,
        price: data.price,
        category: data.category,
        image: data.image,
      });

      // Update the product in Elasticsearch
      await indexProductToES(product);

      return {
        EC: 0,
        EM: "Update product success",
      };
    } else {
      return {
        EC: 2,
        EM: "Product not found",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      EC: 1,
      EM: "Update product failed",
    };
  }
};

const deleteProductService = async (id) => {
  try {
    let product = await Product.findOne({ where: { id: id } });
    if (product) {
      await product.destroy();

      // Remove the product from Elasticsearch
      await removeProductFromES(id);

      return {
        EC: 0,
        EM: "Delete product success",
      };
    } else {
      return {
        EC: 2,
        EM: "Product not found",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      EC: 1,
      EM: "Delete product failed",
    };
  }
};

// Function to sync all existing products to Elasticsearch
const syncProductsToES = async () => {
  try {
    const products = await Product.findAll();
    for (const product of products) {
      await indexProductToES(product);
    }
    console.log(`Synced ${products.length} products to Elasticsearch`);
    return {
      EC: 0,
      EM: `Synced ${products.length} products to Elasticsearch`,
    };
  } catch (error) {
    console.error("Error syncing products to Elasticsearch:", error);
    return {
      EC: 1,
      EM: "Error syncing products to Elasticsearch",
    };
  }
};

const getSimilarProductsService = async (productId) => {
  try {
    // Lấy thông tin sản phẩm gốc để kiểm tra tồn tại
    const product = await Product.findByPk(productId);
    if (!product) return { EC: 1, EM: "Product not found", data: [] };

    // Query 'more_like_this' của Elasticsearch
    const result = await client.search({
      index: PRODUCTS_INDEX,
      body: {
        size: 5, // Lấy 5 sản phẩm tương tự
        query: {
          more_like_this: {
            fields: ["name", "category"], // So sánh dựa trên Tên và Danh mục
            like: [
              {
                _index: PRODUCTS_INDEX,
                _id: productId.toString(),
              },
            ],
            min_term_freq: 1,
            min_doc_freq: 1,
          },
        },
      },
    });

    const products = result.hits.hits.map((hit) => {
      return { ...hit._source, id: hit._id }; // Map lại id cho chắc chắn
    });

    return { EC: 0, data: products };
  } catch (error) {
    console.log("Error getting similar products:", error);
    // Nếu lỗi ES, trả về mảng rỗng để không crash app
    return { EC: 0, data: [] };
  }
};

const getProductStatsService = async (productId) => {
  try {
    // Đếm tổng số lượng đã bán từ bảng OrderItem
    const soldCount =
      (await OrderItem.sum("quantity", {
        where: { productId: productId },
      })) || 0;

    // Lấy danh sách review và tổng số review
    const { count, rows: reviews } = await Review.findAndCountAll({
      where: { productId: productId },
      include: [
        {
          model: User,
          attributes: ["name", "email"], // Lấy tên người bình luận
        },
      ],
      order: [["createdAt", "DESC"]], // Sắp xếp theo ngày tạo mới nhất
      limit: 5, // Chỉ lấy 5 comment mới nhất để hiển thị nhanh
    });

    return {
      EC: 0,
      data: {
        sold: soldCount,
        totalReviews: count,
        reviews: reviews,
      },
    };
  } catch (error) {
    console.log(error);
    return { EC: 1, EM: "Error getting stats" };
  }
};

const toggleFavoriteService = async (userId, productId) => {
  try {
    // Kiểm tra đã like chưa
    const existing = await Favorite.findOne({
      where: { userId: userId, productId: productId },
    });

    if (existing) {
      await existing.destroy();
      return { EC: 0, EM: "Removed from favorites", status: false }; // status false = chưa like
    } else {
      await Favorite.create({ userId, productId });
      return { EC: 0, EM: "Added to favorites", status: true }; // status true = đã like
    }
  } catch (error) {
    console.log(error);
    return { EC: 1, EM: "Error toggling favorite" };
  }
};

const getFavoritesService = async (userId) => {
  try {
    // Lấy danh sách Product mà User này đã like
    // Dùng User.findByPk kết hợp include Product thông qua bảng phụ Favorite
    const userWithFavorites = await User.findByPk(userId, {
      include: [
        {
          model: Product,
          through: { attributes: [] }, // Không lấy dữ liệu bảng trung gian
        },
      ],
    });

    if (!userWithFavorites) return { EC: 1, EM: "User not found" };

    return {
      EC: 0,
      data: userWithFavorites.Products, // Sequelize tự động đặt tên là Products (số nhiều)
    };
  } catch (error) {
    console.log(error);
    return { EC: 1, EM: "Error fetching favorites" };
  }
};

const getProductByIdService = async (id) => {
  try {
    const product = await Product.findByPk(id);
    if (product) {
      return { EC: 0, data: product };
    }
    return { EC: 1, EM: "Product not found" };
  } catch (error) {
    return { EC: 1, EM: error.message };
  }
};

module.exports = {
  getProductWithPagination,
  createProductService,
  updateProductService,
  deleteProductService,
  searchProductsService,
  syncProductsToES,
  indexProductToES,
  removeProductFromES,

  getSimilarProductsService,
  getProductStatsService,
  toggleFavoriteService,
  getFavoritesService,
  getProductByIdService,
};
