import React from "react";
import {
  Input,
  Select,
  Button,
  Space,
  Card,
  Row,
  Col,
  Slider,
  Tag,
} from "antd";
import {
  SearchOutlined,
  ClearOutlined,
  FilterOutlined,
} from "@ant-design/icons";

const ProductSearchComponent = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  showAdvancedFilters,
  setShowAdvancedFilters,
  onSearch,
  onClear,
  loading,
}) => {
  const categories = [
    { value: "ALL", label: "All Categories" },
    { value: "Electronics", label: "Electronics" },
    { value: "Clothing", label: "Clothing" },
    { value: "Books", label: "Books" },
  ];

  return (
    <Card
      title={
        <Space>
          <SearchOutlined />
          Product Search
          <Tag color="green">Elasticsearch</Tag>
        </Space>
      }
      extra={
        <Button
          type="link"
          icon={<FilterOutlined />}
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        >
          {showAdvancedFilters ? "Hide" : "Show"} Filters
        </Button>
      }
      style={{ marginBottom: 20 }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={12}>
          <Input.Search
            placeholder="Search products by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={onSearch}
            enterButton={<SearchOutlined />}
            size="large"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Select
            value={selectedCategory}
            style={{ width: "100%" }}
            size="large"
            placeholder="Select category"
            onChange={(value) => setSelectedCategory(value)}
            options={categories}
          />
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Button icon={<ClearOutlined />} onClick={onClear} block>
            Clear
          </Button>
        </Col>
      </Row>

      {showAdvancedFilters && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={16}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>
                    <strong>Price Range</strong>
                  </span>
                  <span style={{ color: "#1890ff" }}>
                    ${priceRange[0].toLocaleString()} - $
                    {priceRange[1].toLocaleString()}
                  </span>
                </div>
                <Slider
                  range
                  min={0}
                  max={10000}
                  step={50}
                  value={priceRange}
                  onChange={setPriceRange}
                  tooltip={{
                    formatter: (value) => `$${value.toLocaleString()}`,
                  }}
                  marks={{
                    0: "$0",
                    2500: "$2.5K",
                    5000: "$5K",
                    7500: "$7.5K",
                    10000: "$10K",
                  }}
                />
              </Space>
            </Col>
            <Col xs={24} md={8}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={onSearch}
                  loading={loading}
                  block
                >
                  Apply Filters
                </Button>
                <Button icon={<ClearOutlined />} onClick={onClear} block>
                  Reset All
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      )}
    </Card>
  );
};

export default ProductSearchComponent;
