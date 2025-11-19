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
} from "antd";
import { useEffect, useState, useContext } from "react";
import {
  getProductApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
} from "../util/api";
import { AuthContext } from "../components/context/auth.context";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const ProductPage = () => {
  const { auth } = useContext(AuthContext); // Lấy thông tin auth để check role
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProducts();
  }, [current, pageSize, selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    const res = await getProductApi(current, pageSize, selectedCategory);
    if (res && res.EC === 0) {
      setDataSource(res.data);
      setTotal(res.total);
    }
    setLoading(false);
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

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (value) => `${value.toLocaleString()} đ`,
    },
    { title: "Category", dataIndex: "category", key: "category" },
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

        {auth.user.role === "Admin" && (
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
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <span>Lọc theo danh mục: </span>
        <Select
          defaultValue="ALL"
          style={{ width: 150 }}
          onChange={(value) => {
            setSelectedCategory(value);
            setCurrent(1);
          }}
          options={[
            { value: "ALL", label: "Tất cả" },
            { value: "Electronics", label: "Điện tử" },
            { value: "Clothing", label: "Quần áo" },
            { value: "Books", label: "Sách" },
          ]}
        />
      </div>

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
