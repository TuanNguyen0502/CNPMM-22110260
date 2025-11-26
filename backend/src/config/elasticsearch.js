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
        mappings: {
          properties: {
            id: { type: "integer" },
            name: {
              type: "text",
              analyzer: "standard",
              fields: {
                keyword: { type: "keyword" },
              },
            },
            price: { type: "integer" },
            category: {
              type: "keyword",
            },
            image: { type: "text" },
            createdAt: { type: "date" },
            updatedAt: { type: "date" },
          },
        },
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
          analysis: {
            analyzer: {
              standard: {
                type: "standard",
              },
            },
          },
        },
      });
      console.log(`Created index: ${PRODUCTS_INDEX}`);
    }
  } catch (error) {
    console.error("Error creating products index:", error);
  }
};

// Initialize index on startup
createProductsIndex();

module.exports = {
  client,
  PRODUCTS_INDEX,
};
