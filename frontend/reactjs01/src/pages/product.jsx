import {
  notification,
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
  List,
  Typography,
  Image,
  Tooltip
} from "antd";
import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
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
  SyncOutlined,
  ShoppingCartOutlined,
  EyeOutlined,
  SafetyCertificateOutlined
} from "@ant-design/icons";
import { useCartContext } from "../components/context/cart.context";

const { Text, Title } = Typography;

const ProductPage = () => {
  const { auth } = useContext(AuthContext);
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(8); // Tăng số lượng item mỗi trang cho dạng lưới
  const [total, setTotal] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { addToCart } = useCartContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [current, pageSize, selectedCategory, searchQuery, priceRange]);

  const fetchProducts = async () => {
    setLoading(true);
    const minPrice = showAdvancedFilters ? priceRange[0] : undefined;
    const maxPrice = showAdvancedFilters ? priceRange[1] : undefined;
    
    try {
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
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    setCurrent(1);
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
          description: res.EM || "Products synced to Elasticsearch successfully!",
        });
      } else {
        notification.error({
          message: "Sync Failed",
          description: res.EM || "Failed to sync products.",
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
      await fetchProducts();
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

  const handleAddToCart = (e, product) => {
    e.stopPropagation(); // Ngăn sự kiện click vào card
    addToCart(product);
    notification.success({
      message: "Thành công",
      description: `Đã thêm ${product.name} vào giỏ hàng`,
    });
  };

  const handleEdit = (e, product) => {
    e.stopPropagation();
    setIsModalOpen(true);
    form.setFieldsValue(product);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div style={{ padding: "30px", maxWidth: 1400, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Title level={2} style={{ margin: 0 }}>Danh sách sản phẩm</Title>

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
                  form.resetFields();
                }}
              >
                Thêm mới
              </Button>
            </>
          )}
        </Space>
      </div>

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

      {(searchQuery || selectedCategory !== "ALL" || showAdvancedFilters) && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Space wrap>
            <Tag color="blue">{total} kết quả</Tag>
            {searchQuery && <Tag color="green">Tìm kiếm: "{searchQuery}"</Tag>}
            {selectedCategory !== "ALL" && (
              <Tag color="orange">Danh mục: {selectedCategory}</Tag>
            )}
          </Space>
        </Card>
      )}

      {/* Thay Table bằng List + Card */}
      <List
        loading={loading}
        grid={{
          gutter: 16,
          xs: 1,
          sm: 2,
          md: 3,
          lg: 4,
          xl: 4,
          xxl: 5,
        }}
        dataSource={dataSource}
        pagination={{
          current: current,
          pageSize: pageSize,
          total: total,
          onChange: (page, size) => {
            setCurrent(page);
            setPageSize(size);
          },
          showSizeChanger: true,
          pageSizeOptions: ["8", "16", "24"],
          align: "center",
        }}
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              style={{ height: "100%", display: "flex", flexDirection: "column" }}
              bodyStyle={{ flex: 1, display: "flex", flexDirection: "column" }}
              cover={
                <div style={{ padding: 10, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Image
                      alt={item.name}
                      src={item.image || "https://placehold.co/200x200?text=No+Image"}
                      preview={false}
                      style={{ 
                        maxHeight: "100%", 
                        maxWidth: "100%", 
                        objectFit: "contain",
                        transition: "transform 0.3s"
                      }}
                    />
                </div>
              }
              onClick={() => navigate(`/products/${item.id}`)}
              actions={[
                <Tooltip title="Thêm vào giỏ">
                    <ShoppingCartOutlined 
                        key="cart" 
                        style={{ fontSize: 18, color: "#1677ff" }} 
                        onClick={(e) => handleAddToCart(e, item)}
                    />
                </Tooltip>,
                <Tooltip title="Xem chi tiết">
                    <EyeOutlined 
                        key="view" 
                        style={{ fontSize: 18 }} 
                        onClick={() => navigate(`/products/${item.id}`)}
                    />
                </Tooltip>,
                ...(auth.user.role === "Admin" ? [
                    <Tooltip title="Chỉnh sửa">
                        <EditOutlined 
                            key="edit" 
                            style={{ fontSize: 18, color: "#faad14" }} 
                            onClick={(e) => handleEdit(e, item)}
                        />
                    </Tooltip>,
                    <Popconfirm
                        title="Xóa sản phẩm"
                        description="Bạn có chắc muốn xóa sản phẩm này?"
                        onConfirm={() => handleDelete(item.id)}
                        onCancel={(e) => e.stopPropagation()}
                        okText="Có"
                        cancelText="Không"
                    >
                        <DeleteOutlined 
                            key="delete" 
                            style={{ fontSize: 18, color: "#ff4d4f" }} 
                            onClick={handleDeleteClick} // Chỉ chặn click, Popconfirm sẽ handle
                        />
                    </Popconfirm>
                ] : [])
              ]}
            >
              <div style={{ flex: 1 }}>
                <Tag color={item.category === 'Electronics' ? 'cyan' : item.category === 'Clothing' ? 'purple' : 'gold'}>
                    {item.category}
                </Tag>
                <Title level={5} ellipsis={{ rows: 2 }} style={{ margin: "10px 0", height: 48 }}>
                  <Link 
                    to={`/products/${item.id}`} 
                    style={{ color: "inherit" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.name}
                  </Link>
                </Title>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text type="danger" strong style={{ fontSize: 18 }}>
                        {item.price?.toLocaleString()} đ
                    </Text>
                    {item.category === 'Electronics' && (
                        <SafetyCertificateOutlined style={{ color: '#52c41a' }} />
                    )}
                </div>
              </div>
            </Card>
          </List.Item>
        )}
      />

      {/* Modal giữ nguyên */}
      <Modal
        title={form.getFieldValue("id") ? "Cập nhật sản phẩm" : "Thêm mới sản phẩm"}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
        }}
        okText="Lưu"
        cancelText="Hủy"
        maskClosable={false}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="id" hidden><Input /></Form.Item>

          <Form.Item
            label="Tên sản phẩm"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Giá tiền"
            name="price"
            rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
          >
            <InputNumber 
                style={{ width: "100%" }} 
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                addonAfter="VND"
            />
          </Form.Item>

          <Form.Item
            label="Danh mục"
            name="category"
            rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
          >
            <Select
              options={[
                { value: "Electronics", label: "Điện tử" },
                { value: "Clothing", label: "Quần áo" },
                { value: "Books", label: "Sách" },
                { value: "Furniture", label: "Nội thất" },
              ]}
            />
          </Form.Item>

          <Form.Item label="Link Hình ảnh" name="image">
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductPage;