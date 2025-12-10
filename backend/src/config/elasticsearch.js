const { Client } = require("@elastic/elasticsearch");

// Elasticsearch client configuration
const clientConfig = {
  node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
};

// Only add auth if username and password are provided
if (process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD) {
  clientConfig.auth = {
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD,
  };
}

// Optional: Add SSL configuration if needed
// if (process.env.ELASTICSEARCH_SSL_CA) {
//   clientConfig.ssl = {
//     ca: fs.readFileSync(process.env.ELASTICSEARCH_SSL_CA),
//     rejectUnauthorized: false
//   };
// }

const client = new Client(clientConfig);

// Index name for products
const PRODUCTS_INDEX = "products";

// Create products index if it doesn't exist
const createProductsIndex = async () => {
  try {
    const indexExists = await client.indices.exists({
      index: PRODUCTS_INDEX,
    });

    if (!indexExists) {
      await client.indices.create({
        index: PRODUCTS_INDEX,
        settings: {
          number_of_shards: 1, // Số phân mảnh của chỉ mục
          number_of_replicas: 0, // Số bản sao của chỉ mục
          analysis: {
            analyzer: {
              standard: {
                type: "standard", // Bộ mặc định của ES
              },
              // Analyzer tùy chỉnh cho chức năng autocomplete
              autocomplete: {
                tokenizer: "autocomplete", // Sử dụng tokenizer tùy chỉnh được định nghĩa bên dưới
                filter: ["lowercase"],
              },
              // Analyzer tùy chỉnh cho tìm kiếm tự động hoàn thành
              search_autocomplete: {
                tokenizer: "keyword", // Giữ nguyên cụm từ tìm kiếm
                filter: ["lowercase"],
              },
            },
            tokenizer: {
              // Tokenizer tùy chỉnh cho chức năng autocomplete
              autocomplete: {
                type: "edge_ngram", // Sử dụng edge_ngram tokenizer cho autocomplete, ví dụ "Apple" -> "A", "Ap", "App", "Appl", "Apple"
                min_gram: 1, // Độ dài tối thiểu của n-gram
                max_gram: 20, // Độ dài tối đa của n-gram
                token_chars: ["letter", "digit"], // Chỉ lấy chữ cái và chữ số
              },
            },
          },
        },
        mappings: {
          properties: {
            id: { type: "integer" },
            name: {
              type: "text",
              analyzer: "standard",
              fields: {
                keyword: { type: "keyword" }, // Trường phụ để tìm kiếm chính xác
                // Trường phụ để tìm kiếm tự động hoàn thành
                autocomplete: {
                  type: "text",
                  analyzer: "autocomplete", // Sử dụng analyzer cho tự động hoàn thành
                  search_analyzer: "search_autocomplete", // Sử dụng search_analyzer cho tìm kiếm tự động hoàn thành, giữ nguyên cụm từ tìm kiếm, không cắt nhỏ nữa
                },
              },
            },
            price: { type: "integer" },
            category: {
              type: "keyword", // Sử dụng keyword để tìm kiếm chính xác theo danh mục
            },
            image: { type: "text" },
            createdAt: { type: "date" },
            updatedAt: { type: "date" },
          },
        },
      });
      console.log(`Created index: ${PRODUCTS_INDEX}`);
    }
  } catch (error) {
    console.error("Error creating products index:", error);
  }
};

// Function to recreate index with new mapping
const recreateProductsIndex = async () => {
  try {
    // Delete existing index if it exists
    const indexExists = await client.indices.exists({
      index: PRODUCTS_INDEX,
    });

    if (indexExists) {
      await client.indices.delete({
        index: PRODUCTS_INDEX,
      });
      console.log(`Deleted existing index: ${PRODUCTS_INDEX}`);
    }

    // Create new index with updated mapping
    await createProductsIndex();

    return {
      success: true,
      message: `Index ${PRODUCTS_INDEX} recreated successfully`,
    };
  } catch (error) {
    console.error("Error recreating products index:", error);
    return {
      success: false,
      message: "Failed to recreate index",
    };
  }
};

// Initialize index on startup
createProductsIndex();

module.exports = {
  client,
  PRODUCTS_INDEX,
  recreateProductsIndex,
};
