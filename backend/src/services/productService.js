const Product = require("../models/product");
const { Op } = require("sequelize");
const { client, PRODUCTS_INDEX } = require("../config/elasticsearch");

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
      esQuery.bool.should = [
        // Exact phrase match (highest priority)
        {
          multi_match: {
            query: query,
            fields: ["name^4", "category^1"],
            type: "phrase",
            boost: 4
          }
        },
        // Autocomplete field match (great for partial matching)
        {
          match: {
            "name.autocomplete": {
              query: query,
              boost: 3
            }
          }
        },
        // Partial word match with wildcards
        {
          wildcard: {
            name: {
              value: `*${query.toLowerCase()}*`,
              boost: 2.5
            }
          }
        },
        // Prefix match (good for autocomplete)
        {
          multi_match: {
            query: query,
            fields: ["name^2", "category^1"],
            type: "phrase_prefix",
            boost: 2
          }
        },
        // Fuzzy match for typos (lowest priority)
        {
          multi_match: {
            query: query,
            fields: ["name^1.5", "category^1"],
            type: "best_fields",
            fuzziness: "AUTO",
            boost: 1
          }
        }
      ];
      esQuery.bool.minimum_should_match = 1;
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

module.exports = {
  getProductWithPagination,
  createProductService,
  updateProductService,
  deleteProductService,
  searchProductsService,
  syncProductsToES,
  indexProductToES,
  removeProductFromES,
};
