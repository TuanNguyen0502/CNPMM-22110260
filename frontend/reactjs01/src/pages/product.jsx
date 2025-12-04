import {
  notification,
  Table,
  Select,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  Popconfirm,
  Card,
  Tag,
} from "antd";
import { useEffect, useState, useContext } from "react";
import {
  getProductApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  searchProductApi,
  syncProductsApi,
} from "../util/api";
import { AuthContext } from "../components/context/auth.context";
import ProductSearchComponent from "../components/ProductSearchComponent";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  SyncOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useCartContext } from "../components/context/cart.context";

import { Link } from "react-router-dom";

const ProductPage = () => {
  const { auth } = useContext(AuthContext); // Lấy thông tin auth để check role
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { addToCart } = useCartContext();

  useEffect(() => {
    fetchProducts();
  }, [current, pageSize, selectedCategory, searchQuery, priceRange]);

  const fetchProducts = async () => {
    setLoading(true);

    // Always use Elasticsearch search
    const minPrice = showAdvancedFilters ? priceRange[0] : undefined;
    const maxPrice = showAdvancedFilters ? priceRange[1] : undefined;
    const res = await searchProductApi(
      searchQuery,
      current,
      pageSize,
      selectedCategory,
      minPrice,
      maxPrice
    );

    if (res && res.EC === 0) {
      setDataSource(res.data);
      setTotal(res.total);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    setCurrent(1); // Reset to first page when searching
    fetchProducts();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setPriceRange([0, 10000]);
    setShowAdvancedFilters(false);
    setCurrent(1);
  };

  const handleSyncProducts = async () => {
    setSyncLoading(true);
    try {
      const res = await syncProductsApi();
      if (res && res.EC === 0) {
        notification.success({
          message: "Sync Successful",
          description:
            res.EM || "Products synced to Elasticsearch successfully!",
        });
      } else {
        notification.error({
          message: "Sync Failed",
          description: res.EM || "Failed to sync products to Elasticsearch.",
        });
      }
    } catch (error) {
      notification.error({
        message: "Sync Error",
        description: "An error occurred while syncing products.",
      });
    }
    setSyncLoading(false);
  };

  const onFinish = async (values) => {
    const { id, name, price, category, image } = values;
    let res;
    if (id) {
      res = await updateProductApi(id, name, price, category, image);
    } else {
      res = await createProductApi(name, price, category, image);
    }

    if (res && res.EC === 0) {
      notification.success({
        message: id ? "UPDATE PRODUCT" : "CREATE PRODUCT",
        description: "Success",
      });
      setIsModalOpen(false);
      form.resetFields();
      await fetchProducts(); // Load lại bảng
    } else {
      notification.error({
        message: "Error",
        description: res?.EM || "Something wrong",
      });
    }
  };

  const handleDelete = async (id) => {
    const res = await deleteProductApi(id);
    if (res && res.EC === 0) {
      notification.success({
        message: "DELETE PRODUCT",
        description: "Success",
      });
      await fetchProducts();
    } else {
      notification.error({
        message: "Error",
        description: res?.EM || "Delete failed",
      });
    }
  };

  // Hàm xử lý khi bấm thêm vào giỏ
  const handleAddToCart = (product) => {
    // Map dữ liệu từ API sang cấu trúc thư viện yêu cầu (nếu cần)
    const itemToAdd = {
      id: product.id,
      name: product.name,
      price: product.price,
      // quantity sẽ được thư viện tự xử lý (mặc định là 1)
    };
    addToCart(itemToAdd);
    notification.success({
      message: "Thành công",
      description: `Đã thêm ${product.name} vào giỏ hàng`,
    });
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Link
          to={`/products/${record.id}`}
          style={{ color: "#1677ff", fontWeight: "bold" }}
        >
          {text}
        </Link>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (value) => `${value.toLocaleString()} đ`,
    },
    { title: "Category", dataIndex: "category", key: "category" },
    {
      title: "Buy",
      key: "buy",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<ShoppingCartOutlined />}
          onClick={() => handleAddToCart(record)}
        >
          Add
        </Button>
      ),
    },
    ...(auth.user.role === "Admin"
      ? [
          {
            title: "Action",
            key: "action",
            render: (_, record) => (
              <Space>
                <Button
                  icon={<EditOutlined />}
                  type="primary"
                  ghost
                  onClick={() => {
                    setIsModalOpen(true);
                    form.setFieldsValue(record); // Fill dữ liệu cũ vào form
                  }}
                >
                  Edit
                </Button>
                <Popconfirm
                  title="Delete the product"
                  description="Are you sure to delete this product?"
                  onConfirm={() => handleDelete(record.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button icon={<DeleteOutlined />} danger>
                    Delete
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <div style={{ padding: 30 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2>Danh sách sản phẩm</h2>

        <Space>
          {auth.user.role === "Admin" && (
            <>
              <Button
                icon={<SyncOutlined />}
                loading={syncLoading}
                onClick={handleSyncProducts}
                title="Sync products to Elasticsearch"
              >
                Sync ES
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setIsModalOpen(true);
                  form.resetFields(); // Xóa form cũ để nhập mới
                }}
              >
                Add New
              </Button>
            </>
          )}
        </Space>
      </div>

      {/* Search Interface */}
      <ProductSearchComponent
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={(value) => {
          setSelectedCategory(value);
          setCurrent(1);
        }}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        showAdvancedFilters={showAdvancedFilters}
        setShowAdvancedFilters={setShowAdvancedFilters}
        onSearch={handleSearch}
        onClear={handleClearSearch}
        loading={loading}
      />

      {/* Search Results Info */}
      {(searchQuery || selectedCategory !== "ALL" || showAdvancedFilters) && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Space wrap>
            <Tag color="blue">{total} results found</Tag>
            {searchQuery && <Tag color="green">Search: "{searchQuery}"</Tag>}
            {selectedCategory !== "ALL" && (
              <Tag color="orange">Category: {selectedCategory}</Tag>
            )}
            {showAdvancedFilters &&
              (priceRange[0] > 0 || priceRange[1] < 10000) && (
                <Tag color="purple">
                  Price: ${priceRange[0]} - ${priceRange[1]}
                </Tag>
              )}
            <Tag color="gold">Powered by Elasticsearch</Tag>
          </Space>
        </Card>
      )}

      <Table
        loading={loading}
        bordered
        dataSource={dataSource}
        columns={columns}
        rowKey="id"
        pagination={{
          current: current,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20"],
        }}
        onChange={(pagination) => {
          if (pagination.current !== current) setCurrent(pagination.current);
          if (pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize);
            setCurrent(1);
          }
        }}
      />

      <Modal
        title={form.getFieldValue("id") ? "Update Product" : "Create Product"}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        okText="Save"
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please input product name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Price"
            name="price"
            rules={[{ required: true, message: "Please input price!" }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: "Please select category!" }]}
          >
            <Select
              options={[
                { value: "Electronics", label: "Điện tử" },
                { value: "Clothing", label: "Quần áo" },
                { value: "Books", label: "Sách" },
              ]}
            />
          </Form.Item>

          <Form.Item label="Image URL" name="image">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductPage;
