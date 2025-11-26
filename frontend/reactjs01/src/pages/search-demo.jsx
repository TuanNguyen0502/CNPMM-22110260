import React, { useState } from "react";
import {
  Card,
  Typography,
  Space,
  Button,
  Divider,
  Alert,
  List,
  Tag,
} from "antd";
import {
  SearchOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  FilterOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

const SearchDemoPage = () => {
  const [activeDemo, setActiveDemo] = useState(null);

  const searchExamples = [
    {
      title: "Basic Text Search",
      description: "Search for products by name using fuzzy matching",
      example: "Search for 'laptop' or 'phone'",
      query: "laptop",
      features: ["Typo tolerance", "Relevance scoring", "Full-text search"],
    },
    {
      title: "Category Filtering",
      description: "Filter products by specific categories",
      example: "Search 'gaming' in 'Electronics' category",
      query: "gaming",
      category: "Electronics",
      features: ["Exact category match", "Combined with text search"],
    },
    {
      title: "Price Range Filtering",
      description: "Find products within specific price ranges",
      example: "Products between $500 - $2000",
      minPrice: 500,
      maxPrice: 2000,
      features: ["Min/Max price filtering", "Real-time slider updates"],
    },
    {
      title: "Advanced Combined Search",
      description: "Combine all filters for precise results",
      example: "'gaming laptop' in Electronics, $1000-$3000",
      query: "gaming laptop",
      category: "Electronics",
      minPrice: 1000,
      maxPrice: 3000,
      features: ["Multi-field search", "Boolean queries", "Complex filtering"],
    },
  ];

  const elasticsearchFeatures = [
    {
      title: "Full-Text Search",
      description: "Advanced text analysis with stemming and synonym matching",
      icon: <SearchOutlined style={{ color: "#1890ff" }} />,
    },
    {
      title: "Fuzzy Matching",
      description: "Handles typos and similar spellings automatically",
      icon: <ThunderboltOutlined style={{ color: "#52c41a" }} />,
    },
    {
      title: "Real-time Indexing",
      description: "Products are automatically indexed when created/updated",
      icon: <DatabaseOutlined style={{ color: "#faad14" }} />,
    },
    {
      title: "Advanced Filtering",
      description: "Combine multiple filters with boolean logic",
      icon: <FilterOutlined style={{ color: "#722ed1" }} />,
    },
  ];

  return (
    <div style={{ padding: 30, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <Title level={1}>
          <SearchOutlined /> Elasticsearch Product Search
        </Title>
        <Paragraph style={{ fontSize: 18, color: "#666" }}>
          Powerful search capabilities with real-time filtering and advanced
          query features
        </Paragraph>
      </div>

      <Alert
        message="Search Enhancement"
        description="This application now includes Elasticsearch integration for fast, accurate, and flexible product search with advanced filtering capabilities."
        type="info"
        showIcon
        style={{ marginBottom: 30 }}
      />

      <Card
        title={
          <Space>
            <ThunderboltOutlined style={{ color: "#faad14" }} />
            Key Features
          </Space>
        }
        style={{ marginBottom: 30 }}
      >
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2 }}
          dataSource={elasticsearchFeatures}
          renderItem={(feature) => (
            <List.Item>
              <Card size="small">
                <Space align="start">
                  {feature.icon}
                  <div>
                    <Text strong>{feature.title}</Text>
                    <div style={{ marginTop: 4, color: "#666" }}>
                      {feature.description}
                    </div>
                  </div>
                </Space>
              </Card>
            </List.Item>
          )}
        />
      </Card>

      <Card
        title={
          <Space>
            <SearchOutlined />
            Search Examples
          </Space>
        }
        style={{ marginBottom: 30 }}
      >
        <List
          dataSource={searchExamples}
          renderItem={(example, index) => (
            <List.Item>
              <Card
                size="small"
                style={{ width: "100%" }}
                hoverable
                onClick={() =>
                  setActiveDemo(activeDemo === index ? null : index)
                }
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <Title level={5}>{example.title}</Title>
                    <Paragraph style={{ marginBottom: 8 }}>
                      {example.description}
                    </Paragraph>
                    <Text code>{example.example}</Text>
                  </div>
                  <Button
                    type="link"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDemo(activeDemo === index ? null : index);
                    }}
                  >
                    {activeDemo === index ? "Hide" : "Show"} Details
                  </Button>
                </div>

                {activeDemo === index && (
                  <div
                    style={{
                      marginTop: 16,
                      paddingTop: 16,
                      borderTop: "1px solid #f0f0f0",
                    }}
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <div>
                        <Text strong>Query Parameters:</Text>
                        <div style={{ marginTop: 8 }}>
                          {example.query && (
                            <Tag color="blue">Query: {example.query}</Tag>
                          )}
                          {example.category && (
                            <Tag color="orange">
                              Category: {example.category}
                            </Tag>
                          )}
                          {example.minPrice && (
                            <Tag color="green">
                              Min Price: ${example.minPrice}
                            </Tag>
                          )}
                          {example.maxPrice && (
                            <Tag color="green">
                              Max Price: ${example.maxPrice}
                            </Tag>
                          )}
                        </div>
                      </div>
                      <div>
                        <Text strong>Features Used:</Text>
                        <div style={{ marginTop: 8 }}>
                          {example.features.map((feature, idx) => (
                            <Tag key={idx} color="purple">
                              {feature}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    </Space>
                  </div>
                )}
              </Card>
            </List.Item>
          )}
        />
      </Card>

      <Card
        title={
          <Space>
            <DatabaseOutlined />
            How to Use
          </Space>
        }
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 20,
          }}
        >
          <div>
            <Title level={5}>1. Basic Search</Title>
            <Paragraph>
              Enter keywords in the search box and click search or press Enter.
              The system will find products matching your query.
            </Paragraph>
          </div>
          <div>
            <Title level={5}>2. Toggle Search Engine</Title>
            <Paragraph>
              Use the ES/DB switch to toggle between Elasticsearch and
              traditional database search. Elasticsearch provides more advanced
              features.
            </Paragraph>
          </div>
          <div>
            <Title level={5}>3. Apply Filters</Title>
            <Paragraph>
              Select categories and adjust price ranges using the advanced
              filters. All filters work together for precise results.
            </Paragraph>
          </div>
          <div>
            <Title level={5}>4. Admin Features</Title>
            <Paragraph>
              Admins can sync existing products to Elasticsearch using the "Sync
              ES" button. This ensures the search index is up-to-date.
            </Paragraph>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SearchDemoPage;
