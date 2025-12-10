const Product = require("../models/product");
const { Op } = require("sequelize");
const { client, PRODUCTS_INDEX } = require("../config/elasticsearch");

const Favorite = require("../models/favorite");
const Review = require("../models/review");
const { Order, OrderItem } = require("../models/order");
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
  limit = 1,
  category,
  minPrice,
  maxPrice
) => {
  try {
    let offset = (page - 1) * limit;

    // Build Elasticsearch query, including filters
    let esQuery = {
      // Cho phép kết hợp nhiều điều kiện logic
      bool: {
        must: [], // Mảng các điều kiện tìm kiếm chính
        filter: [],
      },
    };

    // Add text search if query is provided
    if (query && query.trim() !== "") {
      esQuery.bool.must.push({
        // Tìm kiếm từ khóa trên nhiều trường cùng lúc
        multi_match: {
          query: query,
          fields: ["name^2", "category"], // Tăng trọng số của trường name so với category
          type: "best_fields", // Mặc định, tìm kiếm tốt nhất trên các trường được chỉ định
          fuzziness: "AUTO", // Cho phép tìm kiếm mờ (gần đúng) để tự động điều chỉnh số lượng lỗi cho phép dựa trên độ dài của từ khóa người dùng nhập vào
          // Độ dài 0 - 2 ký tự: Phải khớp chính xác (Exact match). Không cho phép sai lỗi nào.
          // Độ dài 3 - 5 ký tự: Cho phép sai 1 lỗi (1 edit distance).
          // Độ dài > 5 ký tự: Cho phép sai 2 lỗi (2 edit distance).
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

    const hits = searchResult.hits; // Lấy kết quả tìm kiếm
    const products = hits.hits.map((hit) => hit._source); // Lấy dữ liệu sản phẩm từ kết quả
    const total = hits.total.value; // Tổng số kết quả tìm được
    // Các key khác như _index, _score, _id là metadata của ES, ta lọc bỏ đi để trả về dữ liệu sạch cho Frontend.

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
    // offset là vị trí bắt đầu lấy dữ liệu
    // limit là số lượng bản ghi lấy ra
    // page là số trang hiện tại
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
    // Nếu không tìm thấy sản phẩm, trả về lỗi
    if (!product) return { EC: 1, EM: "Product not found", data: [] };

    // Query 'more_like_this' của Elasticsearch
    const result = await client.search({
      index: PRODUCTS_INDEX,
      body: {
        size: 5, // Lấy 5 sản phẩm tương tự
        query: {
          more_like_this: {
            fields: ["name", "category"], // So sánh dựa trên Tên và Danh mục
            like: [ // Tài liệu mẫu để so sánh
              {
                _index: PRODUCTS_INDEX,
                _id: productId.toString(),
              },
            ],
            min_term_freq: 1, // Một từ chỉ cần xuất hiện ít nhất 1 lần trong sản phẩm gốc là được coi là từ khóa để đi tìm
            min_doc_freq: 1,  // Từ khóa đó chỉ cần xuất hiện trong ít nhất 1 tài liệu khác là được chấp nhận
            // Vì dữ liệu sản phẩm thường ngắn (tên sản phẩm chỉ vài từ), nếu đặt cao quá thì ES sẽ lọc hết từ khóa và không tìm thấy gì
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
          model: User, // Kèm thông tin User (người bình luận)
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
    // findByPk: Tìm theo primary key (id)
    // Dùng User.findByPk kết hợp include Product thông qua bảng phụ Favorite
    // Sequelize sẽ tự động hiểu mối quan hệ many-to-many này
    const userWithFavorites = await User.findByPk(userId, {
      include: [
        {
          model: Product, // Lấy các Product mà user này đã like
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
    // Lấy thông tin sản phẩm theo ID
    // findByPk = find by primary key
    const product = await Product.findByPk(id);
    if (product) {
      return { EC: 0, data: product };
    }
    return { EC: 1, EM: "Product not found" };
  } catch (error) {
    return { EC: 1, EM: error.message };
  }
};

const createReviewService = async (userId, productId, content, rating) => {
  try {
    if (!content || !rating) {
      return { EC: 1, EM: "Missing content or rating" };
    }

    // Kiểm tra xem user đã mua sản phẩm này chưa
    const hasPurchased = await Order.findOne({
      where: { userId: userId }, // Tìm đơn hàng của user
      include: [
        {
          model: OrderItem,
          where: { productId: productId }, // Tìm sản phẩm trong đơn hàng
          required: true, // Bắt buộc phải có (Inner Join)
        },
      ],
    });

    if (!hasPurchased) {
      return {
        EC: 1,
        EM: "Bạn cần mua sản phẩm này trước khi đánh giá!",
      };
    }

    await Review.create({
      userId: userId,
      productId: productId,
      content: content,
      rating: rating,
    });

    return {
      EC: 0,
      EM: "Create review successfully",
    };
  } catch (error) {
    console.log(error);
    return { EC: 1, EM: "Error creating review" };
  }
};

const checkUserBuyProductService = async (userId, productId) => {
  try {
    const order = await Order.findOne({
      where: { userId: userId },
      include: [
        {
          model: OrderItem, // Kiểm tra trong các OrderItem
          where: { productId: productId },
          required: true, // Inner Join: Bắt buộc phải có sản phẩm này trong đơn
        },
      ],
    });

    // Nếu tìm thấy đơn hàng -> true (đã mua), ngược lại -> false
    return {
      EC: 0,
      data: !!order,
    };
  } catch (error) {
    console.log(error);
    return { EC: 1, EM: "Error checking purchase" };
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
  createReviewService,
  checkUserBuyProductService,
};
