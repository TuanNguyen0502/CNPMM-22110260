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

const createProductService = async (data) => {
  try {
    let newProduct = await Product.create({
      name: data.name,
      price: data.price,
      category: data.category,
      image: data.image,
    });
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

module.exports = {
  getProductWithPagination,
  createProductService,
  updateProductService,
  deleteProductService,
};
