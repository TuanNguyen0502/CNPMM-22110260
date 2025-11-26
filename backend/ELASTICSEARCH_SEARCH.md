# Elasticsearch Product Search Implementation

## Overview

This implementation adds powerful search capabilities to your product catalog using Elasticsearch. It includes full-text search, category filtering, and price range filtering.

## Prerequisites

### 1. Install Dependencies

You need to install the Elasticsearch client for Node.js:

```bash
npm install @elastic/elasticsearch
```

### 2. Install and Configure Elasticsearch

You can install Elasticsearch locally or use a cloud service:

#### Local Installation (Docker - Recommended):

```bash
docker run -d --name elasticsearch-cnpmm -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" -e "xpack.security.enabled=false" -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" docker.elastic.co/elasticsearch/elasticsearch:8.11.0
```

#### Environment Variables

Add these to your `.env` file:

```env
ELASTICSEARCH_URL=http://localhost:9200
# No authentication required for local development with security disabled
```

**Note**: The above Docker command disables security for local development. For production environments, you should enable security and use proper authentication.

#### Production Setup (with Security):

For production environments, use security-enabled Elasticsearch:

```bash
docker run -d --name elasticsearch-cnpmm \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "ELASTIC_PASSWORD=your_secure_password" \
  -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
  docker.elastic.co/elasticsearch/elasticsearch:8.11.0
```

Then add authentication to your `.env` file:

```env
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your_secure_password
```

## API Endpoints

### 1. Search Products

**GET** `/api/v1/products/search`

Search for products using Elasticsearch with various filters.

#### Query Parameters:

- `q` (string): Search query for product names
- `page` (number): Page number (default: 1)
- `limit` (number): Number of results per page (default: 10)
- `category` (string): Filter by product category
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter

#### Examples:

**Basic search:**

```http
GET /api/v1/products/search?q=phone
```

**Search with category filter:**

```http
GET /api/v1/products/search?q=phone&category=Electronics
```

**Search with price range:**

```http
GET /api/v1/products/search?q=laptop&minPrice=500&maxPrice=2000
```

**Combined filters:**

```http
GET /api/v1/products/search?q=gaming&category=Electronics&minPrice=800&maxPrice=3000&page=1&limit=20
```

**Response:**

```json
{
  "EC": 0,
  "data": [
    {
      "id": 1,
      "name": "Gaming Laptop",
      "price": 1500,
      "category": "Electronics",
      "image": "laptop.jpg",
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z"
    }
  ],
  "total": 25,
  "totalPages": 3,
  "page": 1,
  "limit": 10,
  "query": "gaming"
}
```

### 2. Sync Products to Elasticsearch

**POST** `/api/v1/products/sync` (Admin only)

Synchronizes all existing products from the database to Elasticsearch. Use this endpoint when:

- Setting up Elasticsearch for the first time
- After data corruption or index recreation
- When migrating existing data

#### Response:

```json
{
  "EC": 0,
  "EM": "Synced 150 products to Elasticsearch"
}
```

## Features

### 1. Full-Text Search

- Searches across product names and categories
- Uses fuzzy matching for typo tolerance
- Boosts name field for better relevance

### 2. Category Filtering

- Exact match filtering by product category
- Case-sensitive matching
- Supports "ALL" to return all categories

### 3. Price Range Filtering

- Filter products by minimum price (`minPrice`)
- Filter products by maximum price (`maxPrice`)
- Supports both or either parameter

### 4. Pagination

- Standard pagination with `page` and `limit` parameters
- Returns total count and total pages

### 5. Automatic Indexing

- New products are automatically indexed when created
- Product updates are automatically synced to Elasticsearch
- Products are automatically removed from index when deleted

## Search Query Examples

### JavaScript/Frontend Usage:

```javascript
// Basic search
const searchProducts = async (query) => {
  const response = await fetch(
    `/api/v1/products/search?q=${encodeURIComponent(query)}`
  );
  return await response.json();
};

// Advanced search with filters
const advancedSearch = async (filters) => {
  const params = new URLSearchParams();

  if (filters.query) params.append("q", filters.query);
  if (filters.category) params.append("category", filters.category);
  if (filters.minPrice) params.append("minPrice", filters.minPrice);
  if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
  if (filters.page) params.append("page", filters.page);
  if (filters.limit) params.append("limit", filters.limit);

  const response = await fetch(`/api/v1/products/search?${params}`);
  return await response.json();
};

// Usage examples
const results1 = await searchProducts("laptop");
const results2 = await advancedSearch({
  query: "gaming",
  category: "Electronics",
  minPrice: 500,
  maxPrice: 2000,
  page: 1,
  limit: 20,
});
```

## Elasticsearch Index Configuration

The products index is configured with:

- **Text analysis**: Standard analyzer for product names
- **Keyword mapping**: For exact category matching
- **Integer mapping**: For price range queries
- **Date mapping**: For sorting by creation/update time

## Error Handling

The implementation includes comprehensive error handling:

- Elasticsearch connection failures fall back gracefully
- Invalid queries return appropriate error messages
- Network timeouts are handled with retry logic

## Performance Considerations

1. **Index Management**: The index is created automatically on startup
2. **Bulk Operations**: Consider implementing bulk indexing for large datasets
3. **Caching**: Consider adding Redis caching for frequently searched queries
4. **Monitoring**: Monitor Elasticsearch cluster health and performance

## Troubleshooting

### Common Issues:

1. **Elasticsearch not running**: Ensure Elasticsearch is running on the configured URL
2. **Authentication errors**: Check username/password in environment variables
3. **Index not found**: Run the sync endpoint to create and populate the index
4. **Performance issues**: Consider optimizing queries or scaling Elasticsearch cluster

### Debug Mode:

Enable debug logging by adding to your Elasticsearch client configuration:

```javascript
const client = new Client({
  // ... other config
  log: "debug", // Add this for debugging
});
```
